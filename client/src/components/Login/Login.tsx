import { API_URL, LOGIN_URL } from "../../config";

const Login = () => {
  return (
    <div>
      <a href={LOGIN_URL}>Login</a>
      <br />
      <a href={`${API_URL}/auth/logout`}>Logout</a>
    </div>
  );
};

export default Login;
