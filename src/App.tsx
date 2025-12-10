import { Analytics } from "@vercel/analytics/react"
import { PortWatchlist } from './components/PortWatchlist'

function App() {
  return (
    <>
      <PortWatchlist />
      <Analytics />
    </>
  )
}

export default App
