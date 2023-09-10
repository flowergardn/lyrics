import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from 'jsdom';
import axios from "axios";
import { env } from "~/env.mjs";
import { kv } from "@vercel/kv";

interface ApiResponse {
  meta: {
    status: number;
  };
  response: {
    hits: Hit[];
  };
}

interface Hit {
  highlights: any[];
  index: string;
  type: string;
  result: {
    api_path: string;
    artist_names: string;
    full_title: string;
    header_image_thumbnail_url: string;
    id: number;
    title: string;
    url: string;
  };
}

const scrapeUrl = async (url: string) => {
  const cached = await kv.get<{ lyrics: string; }[]>(url);

  if(!url.includes("-lyrics")) {
    throw new Error("Failed to fetch data");
  }

  if(cached) {
    console.log(`request is cached for ${url}`)
    return cached 
  } 

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const responseText = await response.text()
    const html = responseText.replaceAll("<br/>", "\n");
    const dom = new JSDOM(html);
    const lyricElements = Array.from(dom.window.document.querySelectorAll('[data-lyrics-container="true"]'));
    
    const lyrics = lyricElements
      .map((el) => el.textContent)
      .join("\n")
      .replace(/\[.*?\]/g, "");

    await kv.set(url, lyrics);

    return lyrics;
  } catch (error) {
    console.error(error);
    return null; 
  }
};


const lyrics = async (req: NextApiRequest, res: NextApiResponse) => {
    const geniusResponse: {
        data: ApiResponse
    } = await axios.get(`https://api.genius.com/search?q=${req.query.q}`, {
        headers: {
            Authorization: `Bearer ${env.GENIUS_TOKEN}`
        }
    })

    try {
        const song = geniusResponse.data.response.hits.shift()

        if(!song) {
            res.status(400).json({
                success: false,
                error: "No song found"
            })
            return
        }

        const lyrics = await scrapeUrl(song.result.url)

        res.json({
            lyrics,
            url: song.result.url
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};

export default lyrics;