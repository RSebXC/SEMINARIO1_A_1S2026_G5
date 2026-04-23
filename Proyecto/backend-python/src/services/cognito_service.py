import os
from config.aws_config import cognito_client
from dotenv import load_dotenv
load_dotenv()
CLIENT_ID=os.getenv("COGNITO_CLIENT_ID")
def registrar_usuario(nombre,email,dpi,password):
    r=cognito_client.sign_up(ClientId=CLIENT_ID,Username=email,Password=password,
        UserAttributes=[{"Name":"email","Value":email},{"Name":"name","Value":nombre},{"Name":"custom:dpi","Value":dpi}])
    return {"userSub":r["UserSub"],"confirmationRequired":not r["UserConfirmed"]}
def confirmar_codigo(email,codigo):
    cognito_client.confirm_sign_up(ClientId=CLIENT_ID,Username=email,ConfirmationCode=codigo)
def login_usuario(email,password):
    r=cognito_client.initiate_auth(AuthFlow="USER_PASSWORD_AUTH",ClientId=CLIENT_ID,
        AuthParameters={"USERNAME":email,"PASSWORD":password})
    return r["AuthenticationResult"]
def actualizar_perfil(access_token,nombre=None,dpi=None):
    attrs=[]
    if nombre: attrs.append({"Name":"name","Value":nombre})
    if dpi:    attrs.append({"Name":"custom:dpi","Value":dpi})
    if attrs:  cognito_client.update_user_attributes(AccessToken=access_token,UserAttributes=attrs)
