import google.generativeai as genai

def gemini_insights():
  genai.configure(api_key="AIzaSyD2xeYk9N9HDXR7suqU0650_QlOzwMO0lc")
  myfile = genai.upload_file("graph1.png")
  model = genai.GenerativeModel("gemini-1.5-flash")
  response = model.generate_content([myfile, "\n\n", "What are your insights of this image"])
  return response.text