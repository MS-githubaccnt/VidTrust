from backend.controllers.user_controllers import login_task,register_task
from backend.controllers.signature_controllers import sign_combined_data,verify_signature
def configure_routes(app):
    app.route('/login', methods=['POST'])(login_task)
    app.route('/register', methods=['POST'])(register_task)
    app.route('/sign',methods=['POST'])(sign_combined_data)
    app.route('/verify',methods=['POST'])(verify_signature)