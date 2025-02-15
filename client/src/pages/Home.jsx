import { useNavigate } from "react-router-dom";
import Khteamup from "../components/Khteamup";
import Slogan from "../components/Slogan";
import logo from "../assets/logo.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-10 w-full main-container">
      <div className="col-span-7 left-col">
        <div className="title-container">
          <h1 className="text-2xl font-bold mb-4">Sign In to Your Account</h1>
        </div>
        <div className="form-container">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  id="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="mt-2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  id="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center signin">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
              >
                Sign In
              </button>
            </div>
            <hr />
            <div className="subtitle-container">
              <h1 className="text-sm mb-4">Log in using social network</h1>
            </div>
          </form>
        </div>
      </div>
      <div className="col-span-3 right-col">
        <div className="mb-4">
          <img src={logo} width={70} alt="Logo" />
        </div>
        <div className="title">
          <Khteamup />
        </div>
        <div className="slogan">
          <Slogan />
        </div>
        <div className="signup">
          <h1 className="newhere">NEW HERE?</h1>
          <h6 className="text">
            Sign up and discover a great amount of opportunities.
          </h6>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
