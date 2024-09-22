from controllers.auth_controllers import get_auth_url,auth_token, check_logged_in, logged_out

def configure_routes(app):
    app.route('/auth/url', methods=['GET'])(get_auth_url)
    app.route('/auth/token', methods=['GET'])(auth_token)
    app.route('/auth/logged_in', methods=['GET'])(check_logged_in)
    app.route('/auth/logout', methods=['POST'])(logged_out)