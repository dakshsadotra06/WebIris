import { useState } from 'react';

// Controlled demo target for the agent — public route, no auth needed.
export default function DemoForm() {
  const [done, setDone] = useState(false);

  return (
    <div className="max-w-md mx-auto px-4 pt-12">
      <div className="bg-white text-slate-900 rounded-xl p-6 shadow-xl">
        <h1 className="text-xl font-bold mb-1">Course Registration</h1>
        <p className="text-sm text-slate-500 mb-5">Demo form for the WebIris agent</p>
        {done ? (
          <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-4 text-sm font-medium">
            ✅ Registration submitted!
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Full name</label>
              <input name="name" required placeholder="Your name"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input name="email" type="email" required placeholder="you@example.com"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Phone</label>
              <input name="phone" required placeholder="10-digit phone number"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Course</label>
              <select name="course" required defaultValue=""
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-500">
                <option value="" disabled>Select a course</option>
                <option>B.Tech</option>
                <option>BCA</option>
                <option>MBA</option>
                <option>M.Tech</option>
              </select>
            </div>
            <button type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg py-2.5 text-sm">
              Submit Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
