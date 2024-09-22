from flask import jsonify,request


def login_task():
    return jsonify({"status": "success", "message": "Data received"}), 200


def register_task():
    return jsonify({"status": "success", "message": "Data received"}), 200