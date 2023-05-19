import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import defaultImage from "./default_1.jpg";
import CircularProgress from "@mui/material/CircularProgress";

import {
  alpha,
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  styled,
} from "@mui/material";

const url = "https://api-admin.goloti.com/face-similarity";
const searchUrl = "https://api-admin.goloti.com/index-test";

const App = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [fileObject1, setFileObject1] = useState(null);
  const [fileObject2, setFileObject2] = useState(null);
  const [matchingData, setMatchingData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isConfidentLoading, setConfidentLoading] = useState(false);
  const [isLeftSearchLoading, setLeftSearchLoading] = useState(false);
  const [isRightSearchLoading, setRightSearchLoading] = useState(false);

  const gridRef = useRef(null);

  useEffect(() => {
    if (searchResults?.length > 0) {
      scrollToGrid();
    }
  }, [searchResults]);

  const handleImage1Change = (e) => {
    const file = e.target.files[0];
    setImage1(URL.createObjectURL(file));
    setFileObject1(file);
  };

  const scrollToGrid = () => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleImage2Change = (e) => {
    const file = e.target.files[0];
    setImage2(URL.createObjectURL(file));
    setFileObject2(file);
  };

  const searchBy = async (by) => {
    if (by === "left") {
      setLeftSearchLoading(true);
    } else {
      setRightSearchLoading(true);
    }
    let fileObj = by === "left" ? fileObject1 : fileObject2;
    const formData = new FormData();
    formData.append("image", fileObj);
    formData.append(
      "index",
      "a686cea5edeba4661a9b960939a58e51-1020679236.us-east-1.elb.amazonaws.com"
    );
    formData.append("index_type", "both");
    formData.append("metric_type", "IP");
    formData.append("distance_threshold", "0.4");
    formData.append("max_results", "20");
    formData.append("unit_vector", "True");
    try {
      const response = await axios.post(searchUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Comparison result:", response.data); // Handle the response from the API
      setSearchResults(response.data.data);
      if (by === "left") {
        setLeftSearchLoading(false);
      } else {
        setRightSearchLoading(false);
      }
    } catch (error) {
      console.error("Error comparing images", error);
    }
  };

  const handleCompare = async () => {
    if (image1 && image2) {
      setConfidentLoading(true);
      const formData = new FormData();
      formData.append("images", fileObject1);
      formData.append("images", fileObject2);

      try {
        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Comparison result:", response.data); // Handle the response from the API
        setMatchingData(response.data.data);
        setSearchResults(null);
        setConfidentLoading(false);
      } catch (error) {
        console.error("Error comparing images", error);
      }
    } else {
      console.log("Please select both images");
    }
  };

  const PlaceholderImage = () => (
    <img src={defaultImage} alt="Placeholder" style={styles.image} />
  );

  const DistanceWrapper = styled(Box)(({ theme, color }) => ({
    // width: 30,
    height: 30,
    padding: "10px",
    color: "white",
    display: "flex",
    borderRadius: "4px",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color ? color : theme.palette.primary.main,
  }));

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.imageUploader}>
          <h2 style={styles.title}>Upload Image 1</h2>
          {image1 ? (
            <img src={image1} alt="Image 1" style={styles.image} />
          ) : (
            <PlaceholderImage />
          )}
          <label htmlFor="image1" style={styles.uploadLabel}>
            Select Image
            <input
              type="file"
              id="image1"
              accept="image/*"
              onChange={handleImage1Change}
              style={styles.uploadInput}
            />
          </label>
        </div>
        {isConfidentLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <CircularProgress />
          </div>
        )}
        {matchingData && !isConfidentLoading && (
          <div style={{ marginRight: "60px" }}>
            <p style={styles.paragraph}>
              We are
              <br />
              <span
                style={
                  matchingData?.is_similar
                    ? styles.confidenceValue
                    : styles.redConfidenceValue
                }
              >
                {matchingData?.confidence}
              </span>
              <br />
              that these images belong to the
              <br />
              <span style={styles.samePersonValue}>same person</span>
            </p>
          </div>
        )}

        <div style={styles.imageUploader}>
          <h2 style={styles.title}>Upload Image 2</h2>
          {image2 ? (
            <img src={image2} alt="Image 2" style={styles.image} />
          ) : (
            <PlaceholderImage />
          )}
          <label htmlFor="image2" style={styles.uploadLabel}>
            Select Image
            <input
              type="file"
              id="image2"
              accept="image/*"
              onChange={handleImage2Change}
              style={styles.uploadInput}
            />
          </label>
        </div>
      </div>

      <div style={styles.compareContainer}>
        <button onClick={handleCompare} style={styles.compareButton}>
          Check similarity
        </button>
      </div>

      {matchingData?.is_similar && (
        <>
          <div style={styles.findPersonText}>
            Do you want us to find if this person has their images or videos
            leaked on the internet?
          </div>
          <div style={styles.findButtonsContainer}>
            <Button
              style={styles.findButton}
              onClick={() => searchBy("left")}
              startIcon={
                isLeftSearchLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              Find by Left Image
            </Button>
            <Button
              style={styles.findButton}
              onClick={() => searchBy("right")}
              startIcon={
                isRightSearchLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              Find by Right Image
            </Button>
          </div>
        </>
      )}
      {/* Search Results */}
      <div>
        <Grid ref={gridRef} container spacing={4} pt={4} pl={3} pr={3}>
          {searchResults?.map((search, index) => {
            return (
              <Grid item md={4} xs={4} key={index}>
                <Card>
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        color: "#fff",
                        right: 0,
                        padding: "5px",
                        float: "right",
                      }}
                    >
                      <DistanceWrapper>{search.distance}</DistanceWrapper>
                    </div>
                  </div>

                  <img
                    src={
                      search.source_type === "video"
                        ? search.frameSignedUrl
                        : search.image_url
                    }
                    alt={search.title}
                    width="100%"
                    height="100%"
                    referrerPolicy="no-referrer"
                    style={{
                      objectFit: "contain",
                      aspectRatio: "16/12",
                    }}
                  />

                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        backgroundColor: "rgba(0,0,0,.8)",
                        position: "absolute",
                        color: "white",
                        bottom: 0,
                        left: "50%",
                        width: "100%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <p
                        style={{
                          float: "left",
                          paddingLeft: "10px",
                        }}
                      >
                        <a
                          href={search.page_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Domain: {search.domain}
                        </a>
                      </p>
                      <p
                        style={{
                          float: "right",
                          paddingRight: "10px",
                        }}
                      >
                        {search.source_type}
                      </p>
                    </div>
                  </div>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </div>
  );
};

const styles = {
  compareContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "40px",
  },
  findPersonText: {
    textAlign: "center",
    marginTop: "40px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  findButtonsContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
  },
  findButton: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginRight: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
  },
  samePersonValue: {
    // Define styles for the "same person" text
    marginBottom: "20px", // Add margin bottom for line spacing
    textAlign: "center", // Center align the text
  },
  confidenceValue: {
    color: "green",
    fontWeight: "bold",
    fontSize: "larger",
    marginBottom: "20px",
    textAlign: "center", // Center align the text
  },
  redConfidenceValue: {
    color: "red",
    fontWeight: "bold",
    fontSize: "larger",
    marginBottom: "20px",
    textAlign: "center", // Center align the text
  },
  paragraph: {
    textAlign: "center", // Center align the text
  },
  compareText: {
    marginBottom: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  compareButton: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "#f7f7f7",
  },
  imageUploader: {
    textAlign: "center",
    margin: "0 10px",
    marginRight: "60px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  image: {
    maxWidth: "350px",
    maxHeight: "350px",
    marginBottom: "10px",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  uploadLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "140px",
    height: "40px",
    background: "#007bff",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  uploadInput: {
    display: "none",
  },
};

export default App;
