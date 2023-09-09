import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from 'jsdom';
import axios from "axios";
import { env } from "~/env.mjs";

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
    annotation_count: number;
    api_path: string;
    artist_names: string;
    full_title: string;
    header_image_thumbnail_url: string;
    header_image_url: string;
    id: number;
    lyrics_owner_id: number;
    lyrics_state: string;
    path: string;
    pyongs_count: number;
    relationships_index_url: string;
    release_date_components: {
      year: number;
      month: number;
      day: number;
    };
    release_date_for_display: string;
    release_date_with_abbreviated_month_for_display: string;
    song_art_image_thumbnail_url: string;
    song_art_image_url: string;
    stats: {
      unreviewed_annotations: number;
      hot: boolean;
      pageviews: number;
    };
    title: string;
    title_with_featured: string;
    url: string;
    featured_artists: any[];
    primary_artist: {
      api_path: string;
      header_image_url: string;
      id: number;
      image_url: string;
      is_meme_verified: boolean;
      is_verified: boolean;
      name: string;
      url: string;
    };
  };
}

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

        const response = await fetch(song?.result.url);
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const html = (await response.text()).replaceAll("<br/>","\\n");
        const dom = new JSDOM(html);
        const resp = Array.from(dom.window.document.querySelectorAll('[data-lyrics-container="true"]'))?.map(el => el.textContent).join("\n").replace(/\[.*?\]/g, "")

        res.json({
            lyrics: resp
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};

export default lyrics;