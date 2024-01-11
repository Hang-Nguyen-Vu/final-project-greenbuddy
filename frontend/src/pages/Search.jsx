// Import necessary dependencies, components, and stores.
import { useState } from "react";
import { userStore } from "../stores/userStore";
import { Footer } from "../components/Footer";
import { AdCard } from "../components/AdCard";
import { SearchBar } from "../components/SearchBar";
import { Navbar } from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Swal from "sweetalert2";

// Define the 'Search' functional component.
export const Search = () => {
  const navigate = useNavigate();
  const [filteredAds, setFilteredAds] = useState([]);
  const isLoggedin = userStore((state) => state.isLoggedin);
  const handleLogout = userStore((state) => state.handleLogout);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div>
      <Navbar
        menuItems={[
          { path: "/home", name: "Home" },
          { path: "/search", name: "Search" },
          { path: "/settings", name: "My Setting" },
          { path: "/manage-your-ads", name: "My Products" },
          { path: "/about", name: "About" },
          { path: "/terms", name: "Terms" },
          {
            name: "Logout",
            onClick: () => {
              handleLogout();
              navigate("/login");
            },
          },
        ]}
        menuDesks={[
          { path: "/home", name: "Home" },
          { path: "/settings", name: "My Setting" },
          { path: "/manage-your-ads", name: "My Products" },
          {
            name: "Logout",
            onClick: () => {
              handleLogout();
              navigate("/login");
            },
          },
        ]}
      />
      <div className="main-container">
        <div className="main-wrapper">
          <div className="search-container">
            <SearchBar
              setFilteredAds={setFilteredAds}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          {filteredAds.length > 0 && (
            <h1 className="search-result">Search Result</h1>
          )}
          <ul className="filtered-ads">
            {filteredAds.map((ad) => (
              <AdCard key={ad._id} ad={ad} />
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};
