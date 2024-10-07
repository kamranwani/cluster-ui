import React, { useState } from "react";
import axios from "axios";

function App() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const nClusters = 5;

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
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

  return (
    <div className="min-h-screen bg-[#f6fff7] p-8">
      <h1 className="text-3xl mb-6">Clusters UI</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-6 items-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="border p-2 mb-4 rounded-md"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded text-xs px-5"
        >
          Upload PDF (Max 5 Clusters)
        </button>
      </form>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      <div className="bg-white flex flex-col items-center gap-4 p-4 rounded-lg w-full lg:w-[60vw] mx-auto">
        {clusters.map((cluster, index) => (
          <div
            key={index}
            className="bg-[#f6fff7] p-4 rounded-lg shadow-xl flex flex-col items-start gap-3"
          >
            <h2 className="font-semibold">Cluster {cluster.cluster}</h2>
            <ul className="list-disc text-xs">
              {cluster.topics.map((topic, topicIndex) => (
                <li key={topicIndex} className="list-none mb-2">
                  {Array.isArray(topic) ? topic.join(", ") : topic}
                </li>
              ))}
            </ul>

            {cluster.wordcloud && (
              <div className="mt-4">
                <h3 className="font-medium">Word Cloud:</h3>
                <img
                  src={`data:image/png;base64,${cluster.wordcloud}`}
                  alt={`Cluster ${cluster.cluster} Word Cloud`}
                  className="mt-2"
                />
                <p>{cluster.wordcloud}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
