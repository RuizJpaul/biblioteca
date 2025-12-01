import { NextResponse } from "next/server"

export async function POST() {
  // Return a response that clears the HttpOnly auth cookie
  const res = NextResponse.json({ message: "Logged out" }, {
    status: 200,
    headers: {
      "Set-Cookie": `auth=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Strict`,
    },
  })
  res.headers.set('Access-Control-Allow-Origin', '*')
  return res
}
