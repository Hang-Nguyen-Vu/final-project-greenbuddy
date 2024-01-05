import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userStore } from "../stores/userStore";
import BackArrow from "../components/reusableComponents/BackArrow";
import { AdsList } from "../components/AdsList";
import { Modal, Button } from "react-bootstrap";
// Import Bootstrap styles
import "bootstrap/dist/css/bootstrap.min.css";
import { ContactForm } from "../components/ContactForm";

// This component renders the advertiser's profile
export const Profile = () => {
  const { userId } = useParams();
  const username = userStore((state) => state.username);
  const storeHandleAdvertiserProfile = userStore((state) => state.handleAdvertiserProfileDisplay);
  
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [profileData, setProfileData] = useState({
    introduction: "",
    location: "",
    image: null,
  });
  
  useEffect(() => {
    const getProfileData = async () => {
      try {
        const profileData = await storeHandleAdvertiserProfile(userId);
        if (profileData) {
          setProfileData({
            introduction: profileData.introduction,
            location: profileData.location,
            image: profileData.image
          })
        console.log(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    getProfileData();
  }, [storeHandleAdvertiserProfile, userId]);

  return (
    <>
      <BackArrow />
      <div>
        <h1>{username}</h1>
        <img src={profileData.image} alt={username} />
        <p>Introduction: {profileData.introduction}</p>
        <p>Location: {profileData.location}</p>
      </div>
      <h2>Recent ads</h2>
      <AdsList fetchType="user" userId={userId} />
      <Button onClick={handleShow}>Contact Advertiser</Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <ContactForm
            advertiserName={username}
            handleClose={handleClose}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
