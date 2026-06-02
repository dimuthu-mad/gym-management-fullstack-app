import { API_URL } from "../../config";

const Login = () => {
  return (
    <div>
      <a href={`${API_URL}/auth/login`}>Login</a>
      <br />
      <a href={`${API_URL}/auth/logout`}>Logout</a>
    </div>
  );
};

export default Login;
