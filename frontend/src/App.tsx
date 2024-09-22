import { RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useRef, useState, createContext, useContext, useCallback, ReactNode } from 'react';
import dotenv from 'dotenv';

axios.defaults.withCredentials = true;

// dotenv.config();

const serverUrl = "http://localhost:5000";

interface AuthContextType {
  loggedIn: boolean | null;
  checkLoginState: () => Promise<void>;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

interface PostProps {
  title: string;
  body: string;
}

const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user },
      } = await axios.get(`${serverUrl}/auth/logged_in`);
      setLoggedIn(logged_in);
      if (user) {
        setUser(user);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return (
    <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };

const Dashboard = () => {
  const context = useContext(AuthContext);

  // Check if the context is undefined
  if (!context) {
    return <div>Error: AuthContext not available</div>;
  }

  const { loggedIn, checkLoginState, user } = context;
  const [posts, setPosts] = useState<PostProps[]>([]); // Properly type posts

  useEffect(() => {
    (async () => {
      if (loggedIn === true) {
        try {
          const { data } = await axios.get(`${serverUrl}/user/posts`);
          setPosts(data.posts);
        } catch (err) {
          console.error(err);
        }
      }
    })();
  }, [loggedIn]);

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/auth/logout`);
      checkLoginState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h3>Dashboard</h3>
      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
      <h4>{user?.name}</h4>
      <p>{user?.email}</p>
      <img src={user?.picture} alt={user?.name} />
      <div>
        {posts.map((post, idx) => (
          <div key={idx}>
            <h5>{post.title}</h5>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
    </>
  );
};


const Login = () => {
  const handleLogin = async () => {
    try {
      // Gets authentication url from backend server
      const {
        data: { url },
      } = await axios.get(`${serverUrl}/auth/url`)
      // Navigate to consent screen
      window.location.assign(url)
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <>
      <h3>Login to Dashboard</h3>
      <button className="btn" onClick={handleLogin}>
        Login
      </button>
    </>
  )
}

const Callback = () => {
  const called = useRef(false)
  const context =useContext(AuthContext);
  if (!context) {
    return <div>Error: AuthContext not available</div>;
  }

  const { checkLoginState, loggedIn } = context;
  const navigate = useNavigate()
  useEffect(() => {
    ;(async () => {
      if (loggedIn === false) {
        try {
          if (called.current) return 
          called.current = true
          const res = await axios.get(`${serverUrl}/auth/token${window.location.search}`)
          console.log('response: ', res)
          checkLoginState()
          navigate('/')
        } catch (err) {
          console.error(err)
          navigate('/')
        }
      } else if (loggedIn === true) {
        navigate('/')
      }
    })()
  }, [checkLoginState, loggedIn, navigate])
  return <></>
}

const Home = () => {
  const context =useContext(AuthContext);
  if (!context) {
    return <div>Error: AuthContext not available</div>;
  }

  const { loggedIn } = context;
  if (loggedIn === true) return <Dashboard />
  if (loggedIn === false) return <Login />
  return <></>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/auth/callback', // google will redirect here
    element: <Callback />,
  },
])

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <AuthContextProvider>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </header>
    </div>
  )
}