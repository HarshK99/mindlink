'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Thought {
  id: string
  title: string
  description?: string
  createdat: string
}

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThoughts()
  }, [])

  const fetchThoughts = async () => {
    try {
      const res = await fetch('/api/thoughts')
      if (res.ok) {
        const data = await res.json()
        setThoughts(data)
      }
    } catch (error) {
      console.error('Failed to fetch thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  const addThought = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    try {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (res.ok) {
        const newThought = await res.json()
        setThoughts([newThought, ...thoughts])
        setTitle('')
      }
    } catch (error) {
      console.error('Failed to add thought:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Thoughts</h1>

        <form onSubmit={addThought} className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Thought</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Thought title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Thought
          </button>
        </form>

        <div className="grid gap-4">
          {thoughts.map((thought) => (
            <Link key={thought.id} href={`/thoughts/${thought.id}`}>
              <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">{thought.title}</h3>
                <p className="text-sm text-gray-400">
                  {thought.createdat ? new Date(thought.createdat).toLocaleDateString() : 'No date'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
