import Khteamup from "../components/Khteamup";
import Slogan from "../components/Slogan";
import logo from "../assets/logo.png";

function SignUpPage() {
  return (
    <div className="grid grid-cols-10 w-full main-container">
      <div className="col-span-7 left-col">
        <div className="title-container">
          <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        </div>
        <div className="form-container">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  placeholder="First Name"
                  id="firstname"
                  autoComplete="firstname"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                placeholder="Last Name"
                id="lastname"
                autoComplete="lastname"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
              />
            </div>
            <div>
              <div className="mt-2">
                <input
                  type="phone number"
                  name="email"
                  placeholder="Phone Number"
                  id="phone number"
                  autoComplete="phone number"
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
                  autoComplete="new-password"
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
                  placeholder="Confrim Password"
                  id="password"
                  // autoComplete="new-password"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                style={{ backgroundColor: "#0046b0" }}
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
              >
                Sign Up
              </button>
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
          <h1 className="newhere">Sign In Now</h1>
          <h6 className="text">
            Sign in and discover a great amount of opportunities.
          </h6>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
