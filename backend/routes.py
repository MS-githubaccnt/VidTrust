from controllers import login_task,register_task

def configure_routes(app):
    app.route('/login', methods=['POST'])(login_task)
    app.route('/register', methods=['POST'])(register_task)