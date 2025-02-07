import React from "react";
import Loading from "react-loading";

const Loader = ({loading}) => {
  return (
    <div style={styles.loaderContainer}>
      <Loading type="spin" color="#3498db" height={50} width={50} />
    </div>
  );
};

const styles = {
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full screen height
  },
};

export default Loader;
