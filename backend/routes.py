from controllers.auth_controllers import get_auth_url, auth_token, check_logged_in as check_logged_in_controller, logged_out
from controllers.video_controllers import video_url as video_url_controller
from middleware.auth_middleware import auth_middleware

def configure_routes(app):
    @app.route('/auth/logged_in', methods=['GET'])
    def check_logged_in_route():
        return check_logged_in_controller()

    @app.route('/auth/video_url', methods=['POST'])
    @auth_middleware
    def video_url_route():
        return video_url_controller()

    @app.route('/auth/logout', methods=['POST'])
    @auth_middleware
    def logout_route():
        return logged_out()
    
    app.route('/auth/url', methods=['GET'])(get_auth_url)
    app.route('/auth/token', methods=['GET'])(auth_token)
