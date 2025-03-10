import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthInterceptor from "../../utils/apis";
import "../../assets/scss/login.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginLeftSidebar from "../LoginLeftSidebar/LoginLeftSidebar";
import { useTranslation } from "react-i18next";
import { Oval } from "react-loader-spinner";
import { useDispatch } from "react-redux";
// import useAuthInterceptor from "../../utils/interceptor";

toast.configure();

const Login = () => {
  const apis = useAuthInterceptor();
  const { t } = useTranslation();
  const { loading, setLoading } = useState(false);
  const emailregex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const check_temp = localStorage.getItem("verifyOtp");
  if (check_temp) {
    localStorage.removeItem("retailerOtp");
    localStorage.removeItem("retailer_tempToken");
  }

  const navigate = useNavigate();
  const location = useLocation();
  const path = window.location.pathname;

  let next_path;
  if (location.state) {
    next_path = location.state.url;
  } else {
    next_path = "/retailer/dashboard";
  }

  const token = localStorage.getItem("retailer_accessToken");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [disable, setDisable] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    const admin_accessToken = localStorage.getItem("admin_accessToken");
    const supplier_accessToken = localStorage.getItem("supplier_accessToken");
    const distributor_accessToken = localStorage.getItem(
      "distributor_accessToken"
    );
    const retailer_accessToken = localStorage.getItem("retailer_accessToken");
    if (
      admin_accessToken ||
      supplier_accessToken ||
      retailer_accessToken ||
      distributor_accessToken
    ) {
      if (admin_accessToken) {
        const otherTokens = [
          retailer_accessToken,
          distributor_accessToken,
          supplier_accessToken,
        ];
        const otherTokenExists = otherTokens.some((token) => token !== null);
        if (otherTokenExists) {
          localStorage.removeItem("retailer_accessToken");
          localStorage.removeItem("distributor_accessToken");
          localStorage.removeItem("supplier_accessToken");
          toast.warn("Already logged in as admin", {
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
          });
          navigate("/dashboard");
        } else {
          toast.warn("Already logged in as admin", {
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
          });
          navigate("/dashboard");
        }
      } else {
        if (supplier_accessToken) {
          navigate("/supplier/dashboard");
          toast.warn("Already logged in as supplier", {
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
          });
        } else if (distributor_accessToken) {
          navigate("/distributor/dashboard");
          toast.warn("Already logged in as distributor", {
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
          });
        } else if (retailer_accessToken) {
          navigate("/retailer/dashboard");
          toast.warn("Already logged in as retailer", {
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (path.includes("retailer")) {
      setUser("retailer");
    } else if (path.includes("admin")) {
      setUser("admin");
    } else if (path.includes("distributor")) {
      setUser("distributor");
    } else {
      setUser("supplier");
    }
  }, [path]);

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    let emailValid = true,
      passValid = true;
    if (!emailregex.test(email)) {
      if (email === "") {
        setEmailError(t("retailer.login.email_required"));
      } else {
        setEmailError(t("retailer.login.not_valid_email"));
      }
      emailValid = false;
    }

    if (pass === "") {
      setPassError(t("retailer.login.password_required"));
      passValid = false;
    } else if (pass.length < 8) {
      setPassError(t("retailer.login.password_character_error"));
      passValid = false;
    }

    if (
      emailValid === false ||
      passValid === false ||
      emailError !== "" ||
      passError !== ""
    ) {
      console.log("Validation Error");
    } else {
      setDisable(true);
      const bodyData = {
        email: email,
        password: pass,
        usertype: user === "admin" ? "superadmin" : user,
      };
      if (rememberMe) {
        sessionStorage.setItem(user + "_email", email);
        sessionStorage.setItem(user + "_password", pass);
      }

      apis
        .post("/login", bodyData)
        .then((res) => {
          console.log('api call', res);
          if (res.data.success === true) {
            setDisable(false);
            if (twoFactor) {
              navigate(`/${user}/otp-verification`);
              localStorage.setItem(user + "_tempToken", res.data.data.token);
              localStorage.setItem(user + "Otp", "true");
            } else {
              if (user !== "admin") {
                localStorage.setItem(
                  `${user}_accessToken`,
                  res.data.data.token
                );
                localStorage.setItem(`${user}_userImg`, res.data.data.user_image);
                localStorage.setItem(
                  `userPermissions`,
                  JSON.stringify(res.data.data.permissions)
                );
                localStorage.setItem(
                  `${user}_fullName`, res.data.data.first_name + ' ' + res.data.data.last_name)
                if (res.data.data.userProfile === null) {
                  navigate(`/${user}/complete-general-profile`);
                } else {
                  navigate(`/${user}/dashboard`);
                }
              } else {
                navigate("/dashboard");
                localStorage.setItem("admin_accessToken", res.data.data.token);
                localStorage.setItem(`userImg`, res.data.data.user_image);
                localStorage.setItem(
                  `userPermissions`,
                  JSON.stringify(res.data.data.permissions)
                );
              }
            }
          } else {
            setDisable(false);
            toast.error(res.data.message, {
              autoClose: 3000,
              position: toast.POSITION.TOP_CENTER,
            });
          }
        })
        .catch((error) => {
          setDisable(false);
          if (error.response?.status === 400) {
            toast.error(error.response.data.data.error, {
              autoClose: 3000,
              position: toast.POSITION.TOP_CENTER,
            });
          } else {
            toast.error(error.response.data.message, {
              autoClose: 3000,
              position: toast.POSITION.TOP_CENTER,
            });
          }
        });
    }
  };

  const handleForgot = () => {
    navigate(`${user === "admin" ? "" : "/" + user}/forgot-password`);
  };

  const handlePassChange = (e) => {
    setPass(e.target.value);
    setPassError("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  useEffect(() => {
    if (token) {
      navigate(next_path);
    }
    const retailer_email = sessionStorage.getItem(`${user}_email`);
    if (retailer_email) {
      setEmail(retailer_email);
      setPass(sessionStorage.getItem(`${user}_password`));
    }
  }, [navigate, token, next_path]);
  return (
    <div className="page-wrap">
      <div className="container-fluid g-0">
        <div className="row m-0 login-setup">
          <LoginLeftSidebar />
          <div className="col-md-6 login-setup-right">
            <div className="form-box col col-sm-12 col-md-10 col-lg-8">
              <h3>{t("retailer.login.welcome")}</h3>
              <p className="sub-head">{t("retailer.login.login_p")}</p>
              <hr />
              <form>
                <div className="mb-3 position-relative">
                  <label htmlFor="email" className="form-label">
                    {t("retailer.login.email_address")}
                  </label>
                  <div className="position-relative">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder={t("retailer.login.mail_placeholder")}
                      value={email}
                      onChange={(e) => handleEmailChange(e)}
                    />
                    <span className="form-field-icon">
                      <svg
                        className="form-abs-img"
                        width="20"
                        height="16"
                        viewBox="0 0 20 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" />
                      </svg>
                    </span>
                  </div>
                  {emailError !== "" ? (
                    <p className="error-label">{emailError}</p>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label">
                    {t("retailer.login.password")}
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control"
                      id="password"
                      placeholder={t("retailer.login.password_placeholder")}
                      value={pass}
                      onChange={(e) => handlePassChange(e)}
                    />
                    <span
                      className={
                        showPass
                          ? "form-field-icon icon-toggle active"
                          : "form-field-icon icon-toggle"
                      }
                      onClick={() => setShowPass(!showPass)}
                    ></span>
                  </div>
                  {passError !== "" ? (
                    <p className="error-label">{passError}</p>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="row mb-1 mx-0">
                  <div className="form-check col checkOption">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      value={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      {t("retailer.login.remember_me")}
                    </label>
                  </div>
                  <div className="col forgot-pass-box text-end px-0">
                    <p className="custom-atag" onClick={() => handleForgot()}>
                      {t("retailer.login.forgot_password")}
                    </p>
                  </div>
                </div>
                {user === "retailer" && (
                  <div className="col forgot-pass-box text-end px-0">
                    <p>
                      {t("retailer.login.dont_have_an_account")}{" "}
                      <a
                        className="custom-atag"
                        onClick={() => navigate("/retailer/sign-up")}
                      >
                        {t("retailer.login.signup")}
                      </a>
                    </p>
                  </div>
                )}
                <div className="form-check form-switch mb-3 enable_2_fa">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="enableSwitch"
                    onChange={(e) => setTwoFactor(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableSwitch">
                    {t("retailer.login.enable_2fa")}
                  </label>
                </div>
                {disable ? (
                  <Oval
                    color="purple"
                    secondaryColor="purple"
                    height={40}
                    width={40}
                  />
                ) : (
                  <button
                    disabled={disable}
                    className="btn btn-purple"
                    onClick={(e) => handleSubmit(e)}
                  >
                    {t("retailer.login.submit")}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
