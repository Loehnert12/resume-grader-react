import { useState } from 'react'
import './App.css'
import ReactMarkdown from 'react-markdown'

function App() {

  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  function getScoreColor(score) {
    if (score >= 80) return "#4caf50"  // green
    if (score >= 60) return "#ff9800"  // orange
    return "#f44336"                    // red
  }

  function handleReset() {
    setFile(null)
    setResult(null)
    setError(null)
    setIsLoading(false)
  }

  async function handleSubmit() {
    if (!file) return
    
    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/grade-resume`, {
        method: "POST",
        body: formData
      })

      if (!response.ok) throw new Error("Server error. Please try again.")

      const data = await response.json()

      const text = data.result
      const scoreMatch = text.match(/SCORE:\s*(\d+)/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null
      const issues = text.split("ISSUES:")[1]?.trim()

      setError(null)
      setResult({ score, issues })
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <div className="container">
      <h1>ATS Resume Grader</h1>
      <div className="upload-section">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.doc,.docx"/>
        <button onClick={handleSubmit} disabled={isLoading}>Submit</button>
      </div>
      <div>
        {isLoading && <p>Grading your resume...</p>}
        {error && <p style={{color: "#f44336"}}>{error}</p>}
        {result && (
          <div>
            <h2 className="score" style={{color: getScoreColor(result.score)}}>
              {result.score}/100
            </h2>
            <div className="issues">
              <h3>Issues</h3>
              {result.issues.split("\n").filter(line => line.trim().startsWith("-")).map((issue, index) => (
                <div className="issue-card" key={index}>
                  <ReactMarkdown>{issue.replace(/^-\s*/, "")}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        )}
      <button onClick={handleReset} className="reset-button">Grade Another Resume</button>
      </div>
    </div>

  )

}

export default App