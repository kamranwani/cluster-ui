import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState(""); // State to track the file name
  const nClusters = 5;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    setFileName(file ? file.name : ""); // Update fileName state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("n_clusters", nClusters);
      formData.append("files", pdfFile);

      const response = await axios.post(
        "https://cluster-poc-4ba2ee28df2f.herokuapp.com/cluster-documents/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setClusters(response.data.clusters);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(clusters);
  }, [clusters]);
  return (
    <div className="min-h-screen custom-gradient px-12 pb-16 pt-4 flex flex-col gap-8">
      <div>
        <h1 className="text-4xl mb-6 text-white">Clusters UI</h1>
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col items-center"
        >
          <div
            className="border-2 border-dashed border-neutral-300 p-6 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-900 transition"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              required
            />
            <p className="text-gray-200">Drag and drop your PDF file here</p>
            <p className="text-gray-400">or click to upload</p>
            {fileName && (
              <p className="text-blue-500 mt-2">Selected file: {fileName}</p>
            )}
          </div>
          <button
            type="submit"
            className="mt-4 hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500 bg-gradient-to-r from-blue-800 to-green-700 text-white p-2 rounded text-xs px-5"
          >
            Upload PDF
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center text-white">Loading Clusters...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      <div className="bg-transparent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 rounded-lg w-full lg:w-[80vw] mx-auto">
        {clusters.map((cluster, index) => (
          <div
            key={index}
            className="bg-black/10 hover:bg-black/40 backdrop-blur-lg rounded-lg shadow-lg p-4 gap-3 flex flex-col items-start  max-h-[300px] overflow-auto specific-component group"
          >
            <h2 className="font-semibold text-lg text-neutral-100 group-hover:text-blue-500">
              Cluster {cluster.cluster}
            </h2>
            <ul className="text-xs text-neutral-200 group-hover:text-green-500">
              {cluster.topics.map((topic, topicIndex) => {
                if (typeof topic === "string") {
                  try {
                    const parsedTopic = JSON.parse(topic.replace(/'/g, '"'));
                    return parsedTopic.map((subTopic, subIndex) => (
                      <li
                        key={`${topicIndex}-${subIndex}`}
                        className="list-none mb-2 uppercase"
                      >
                        {subTopic}
                      </li>
                    ));
                  } catch (error) {
                    console.error("Error parsing topic:", error);
                  }
                }

                return (
                  <li key={topicIndex} className="list-none mb-2">
                    {topic}
                  </li>
                );
              })}
            </ul>

            {cluster.wordcloud && (
              <div className="mt-4">
                <h3 className="font-medium">Word Cloud:</h3>
                <img
                  src={`data:image/png;base64,${cluster.wordcloud}`}
                  alt={`Cluster ${cluster.cluster} Word Cloud`}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
