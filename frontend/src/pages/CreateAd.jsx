import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adStore } from "../stores/adStore";
import { userStore } from "../stores/userStore";
import Swal from "sweetalert2";
import BackArrow from "../components/reusableComponents/BackArrow";
import { Dropdown } from "../components/reusableComponents/Dropdown";
import { Button } from "../components/reusableComponents/Button";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";
import "./createAd.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const CreateAd = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [address, setAddress] = useState("");
  const [observation, setObservation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { createAd } = adStore();

  // Get 'isLoggedIn' and 'accessToken' from the 'userStore'.
  const isLoggedin = userStore((state) => state.isLoggedin);
  const handleLogout = userStore((state) => state.handleLogout);
  // useEffect hook to check user authentication status.
  useEffect(() => {
    if (!isLoggedin) {
      // If the user is not logged in, show an alert and navigate to the login route.
      Swal.fire({
        title: "Error!",
        text: "Please log in to see the content",
        icon: "error",
      });
      navigate("/login");
    }
  }, [isLoggedin, navigate]);

  // Define units for dropdown
  const unitOptions = [
    { label: "Kilogram (kg)", value: "kg" },
    { label: "Grams (g)", value: "g" },
    { label: "Liter (L)", value: "l" },
    { label: "Milliliter (mL)", value: "ml" },
    { label: "Units (u)", value: "u" },
    { label: "Meter (m)", value: "m" },
    { label: "Centimeters (cm)", value: "cm" },
    { label: "Square Meter (m²)", value: "m2" },
  ];

  const style = {
    height: 300,
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    if (
      !image ||
      !title ||
      !description ||
      !product ||
      !quantity ||
      !unit ||
      !address ||
      !pickupDate
    ) {
      setIsLoading(false); // Stop loading if validation fails
      Swal.fire({
        title: "Oops!",
        text: "All fields are required",
        icon: "error",
      });
      return;
    }

    try {
      await createAd(
        {
          title,
          description,
          product,
          quantity,
          unit,
          address,
          observation,
          pickupDate,
        },
        image
      );
      Swal.fire({
        title: "Success!",
        text: "Your ad has been created.",
        icon: "success",
      }).then(() => {
        navigate(-1);
      });

      // Reset form fields after submission
      setImage(null);
      setTitle("");
      setDescription("");
      setProduct("");
      setQuantity("");
      setUnit("");
      setAddress("");
      setObservation("");
      setPickupDate("");
    } catch (error) {
      Swal.fire({
        title: "Failed!",
        text: "There was a problem creating your ad.",
        icon: "error",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <>
      <Navbar
        menuItems={[
          { path: "/home", name: "Home" },
          { path: "/search", name: "Search" },
          { path: "/settings", name: "My Settings" },
          { path: "/manage-your-ads", name: "My Products" },
          { path: "/about", name: "About" },
          { path: "/terms", name: "Terms" },
          {
            name: "Logout",
            onClick: () => {
              handleLogout();
              navigate("/");
            },
          },
        ]}
        menuDesks={[
          { path: "/home", name: "Home" },
          { path: "/search", name: "Search" },
          { path: "/settings", name: "My Settings" },
          { path: "/manage-your-ads", name: "My Products" },

          {
            name: "Logout",
            onClick: () => {
              handleLogout();
              navigate("/");
            },
          },
        ]}
        logoRedirectPath="/home"
      />

      <div className="main-container">
        <div className="main-wrapper">
          <div className="create-ad-container">
            <BackArrow />
            <h1>Add a product</h1>
            {isLoading ? (
              <div className="loading-container">
                <Lottie
                  animationData={loadingAnimation}
                  options={{
                    loop: true,
                    autoplay: true,
                  }}
                  style={style}
                />
              </div>
            ) : (
              <form className="create-ad-form" onSubmit={handleSubmit}>
                <div>
                  <label>Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomatoes to share"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label>Description:</label>
                  <textarea
                    value={description}
                    placeholder="Your description of your products"
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label>Product:</label>
                  <input
                    type="text"
                    value={product}
                    placeholder="e.g. Cherry tomatoes"
                    onChange={(e) => setProduct(e.target.value)}
                  />
                </div>
                <div>
                  <label>Quantity:</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label>Unit:</label>
                  <Dropdown
                    options={unitOptions}
                    value={unit}
                    onChange={handleUnitChange}
                    defaultOption="Select Unit"
                  />
                </div>
                <div>
                  <label>Location:</label>
                  <input
                    type="text"
                    placeholder="Stockholm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label>Pickup Time:</label>
                  <input
                    type="datetime-local"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
                <div>
                  <label>Observation:</label>
                  <input
                    type="text"
                    placeholder="e.g. Please bring a bag with you"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                  />
                </div>
                <div>
                  <label>Image:</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      console.log("File selected:", e.target.files[0]);
                      setImage(e.target.files[0]);
                    }}
                  />
                </div>
                <Button
                  label="Create Ad"
                  className="button"
                  onClick={(e) => handleSubmit(e)}
                />
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

//Component to create an Ad
