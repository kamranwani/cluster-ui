import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [clusters, setClusters] = useState([]);
  const [wordclouds, setWordclouds] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [nClusters, setNClusters] = useState(5);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    setFileName(file ? file.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("files", pdfFile);

      // Send n_clusters as a query param
      const response = await axios.post(
        `https://cluster-poc-4ba2ee28df2f.herokuapp.com/cluster-documents/?n_clusters=${nClusters}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      setClusters(response.data.clusters);
      setWordclouds(response.data.wordclouds);
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
        <h1 className="text-4xl mb-6 text-white border-b border-white/30 pb-4">
          Clusters UI
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col lg:flex-row items-end justify-center gap-10"
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
          <div>
            <div className="mb-4 flex items-center gap-2">
              <label className="block mb-1 text-xs text-neutral-300">
                Number of Clusters:
              </label>
              <input
                type="number"
                value={nClusters}
                onChange={(e) => setNClusters(e.target.value)}
                className="px-2 py-1 rounded-md bg-gray-400 border-none outline-none focus:border-green-500 focus:outline-none w-3/5"
                min="1"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-4 hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500 bg-gradient-to-r from-blue-800 to-green-700 text-neutral-900 p-2 rounded text-xs px-5"
              >
                Upload PDF
              </button>
            </div>
          </div>
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
            className="bg-black/10 hover:bg-black/40 backdrop-blur-lg rounded-lg shadow-lg p-4 gap-3 flex flex-col items-start max-h-[300px] overflow-auto specific-component group"
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

            {wordclouds[`cluster_${cluster.cluster}_wordcloud`] && (
              <div className="mt-4">
                <h3 className="font-medium text-neutral-100 text-lg">
                  Word Cloud:
                </h3>
                <img
                  src={`data:image/png;base64,${
                    wordclouds[`cluster_${cluster.cluster}_wordcloud`]
                  }`}
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
