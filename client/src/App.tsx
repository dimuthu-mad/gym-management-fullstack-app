import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Main from "./Layout/Main";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";
import Gyms from "./components/Gyms/Gyms";
import ViewGymById from "./components/Gyms/ViewGymById";
import CreateGym from "./components/Gyms/CreateGym";
import CreateReview from "./components/Reviews/CreateReview";
import Schedule from "./components/Schedule/Schedule";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "gyms",
        element: <Gyms />,
      },
      {
        path: "gyms/create",
        element: (
          <ProtectedRoute>
            <CreateGym />
          </ProtectedRoute>
        ),
      },
      {
        path: "gyms/:id",
        element: <ViewGymById />,
      },
      {
        path: "gyms/:id/reviews",
        element: (
          <ProtectedRoute>
            <CreateReview />
          </ProtectedRoute>
        ),
      },
      {
        path: "gyms/:id/schedules",
        element: (
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        ),
      },
      {
        path: "schedules",
        element: (
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
