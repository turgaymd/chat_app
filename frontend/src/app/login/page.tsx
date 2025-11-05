"use client";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { BiUser } from "react-icons/bi";
import { CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../AuthContext";
import { socket } from "../Socket";
import Link from "next/link";
import { ApiContext } from "../ApiContext";
import { redirect } from "next/navigation";

const Login = () => {
  const [username, setUsername] = useState("");
  const [error,setError]=useState(false)
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState<boolean>(false);
  const [hide, setHide] = useState<boolean>(false);
  const { setUser, setToken } = useContext(AuthContext);
  const { apiUrl } = useContext(ApiContext);
  useEffect(() => {
    if (logged) {
      redirect("/home");
    }
  }, [logged]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false)
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      const response = await axios.post(
        `${apiUrl}/api/login`,
        { username, password },
        config
      );
      window.localStorage.setItem("userInfo", JSON.stringify(response));
      socket.connect();
      setUser(response.data);
      setToken(response.data.token);
      toast.success("Successfully logged");
      socket.emit('join',username)
      socket.emit('online',username)
      setTimeout(() => {
        setLogged(true);
      }, 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        setError(true)
      }
    }
  };
  return (
    <>
<ToastContainer/>
      <div className="auth">
        <div className="container chat-login">
          <div className="login-card">
            <div className="justify-content-center row">
              <div className="col-md-4">
                <form onSubmit={handleSubmit}>
                  <div className="card authentication">
                    <div className="title text-center">
                      <h2 className="text-center ">Sign in</h2>
                      <p className="">Sign in to continue</p>
                    </div>
                    <label>Username</label>
                    <div className="mb-3 position-relative">
                      <i className="btn  position-absolute ">
                        <BiUser fontSize={18} />
                      </i>
                      <input type="text" placeholder="Enter Username" className="rounded-lg w-full focus:bg-none" name="username" onChange={(e) => setUsername(e.target.value)} maxLength={20}/>
                    </div>
                    <div>
                      <div className="pass-input d-flex justify-content-between pt-2">
                        <label className="bs-gray-400">Password</label>
                      </div>
                      <div className="position-relative">
                        <i className="btn position-absolute  ">
                          <CiLock fontSize={20} />
                        </i>
                        <input type={hide ? "password" : "text"} autoComplete="username" placeholder="Enter Password" className="px-3 py-1.5 rounded-lg w-full"  name="password" onChange={(e) => setPassword(e.target.value)} minLength={8}/>
                        {hide ? (
                          <i className="btn hide" onClick={() => setHide(false)}>
                            <FaEyeSlash />
                          </i>
                        ) : (
                          <i className="btn hide" onClick={() => setHide(true)}>
                            <FaEye />
                          </i>
                        )}
                      </div>
                    </div>
                    <div className="submit-btn mt-4">
                      <button type="submit" className="btn text-white">
                        {/* {pending ? "Loading...":'Login'} */} Login
                      </button>
                    </div>
                    <div className="d-flex justify-center align-itms-center mt-4">
                    {
                    error ? ( <p className="text-red-500"> Invalid username or password</p>) : <></>
                  }
                  </div>
                  </div>                
                </form>
              </div>
            </div>
          </div>
          <div className="text-center text-white mt-3">
            {" "}
            Do not have an account? <Link href="/">Register</Link>
       
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
