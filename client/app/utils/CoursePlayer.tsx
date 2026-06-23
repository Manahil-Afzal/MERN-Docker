import axios from 'axios';
import React, {FC, useEffect, useState} from 'react'

type Props = {
    videoUrl: string;
    title: string;
}

const isDirectUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeVideoSource = (value: string) => {
    const source = (value || "").trim();

    if (!source) {
        return "";
    }

    if (isDirectUrl(source)) {
        return source;
    }

    if (/^(www\.|m\.|youtube\.com|youtu\.be|vimeo\.com)/i.test(source)) {
        return `https://${source}`;
    }

    return source;
};

const isEmbeddableIframeUrl = (value: string) =>
    /youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|player\.vimeo\.com/i.test(value);

const toEmbedUrl = (value: string) => {
    if (/youtube\.com\/watch\?v=/i.test(value)) {
        try {
            const parsed = new URL(value);
            const videoId = parsed.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : value;
        } catch {
            return value;
        }
    }

    if (/youtu\.be\//i.test(value)) {
        const videoId = value.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : value;
    }

    if (/youtube\.com\/shorts\//i.test(value)) {
        const videoId = value.split('shorts/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : value;
    }

    if (/vimeo\.com\//i.test(value) && !/player\.vimeo\.com\//i.test(value)) {
        const videoId = value.split('vimeo.com/')[1]?.split('?')[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : value;
    }

    return value;
};

const CoursePlayer:FC<Props> = ({videoUrl, title}) => {
     const [videoData, setVideoData] = useState({
        otp: "",
        playbackInfo: "",
     });
         const [loading, setLoading] = useState(false);
         const [error, setError] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const source = normalizeVideoSource(videoUrl || "");

        if (!source) {
            setVideoData({ otp: "", playbackInfo: "" });
            setLoading(false);
            setError(true);
            return;
        }

        if (isDirectUrl(source)) {
            setVideoData({ otp: "", playbackInfo: "" });
            setLoading(false);
            setError(false);
            return;
        }

        setLoading(true);
        setError(false);
        axios
            .post(
                `${(process.env.NEXT_PUBLIC_SERVER_URI || "https://zylo-learning.vercel.app/api/v1/").replace(/\/$/, "")}/getVdoCipherOTP`,
                {
                    videoId: source,
                }
            )
            .then((res) => {
                setVideoData(res.data);
                setLoading(false);
            })
            .catch(() => {
                setVideoData({ otp: "", playbackInfo: "" });
                setLoading(false);
                setError(true);
            });
    }, [videoUrl]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const source = normalizeVideoSource(videoUrl || "");
  const directLink = isDirectUrl(source);
    const iframeSource = toEmbedUrl(source);
    const showOtpPlayer = videoData.otp && videoData.playbackInfo !== "";
  const showError = !directLink && !showOtpPlayer && error && !loading;

  return (
    <div style={{paddingTop: "41%", position: "relative"}}>
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/5 text-purple-400">
                Loading video...
            </div>
        )}

        {directLink && !isEmbeddableIframeUrl(source) && (
            <video
                src={source}
                controls
                onError={() => setError(true)}
                style={{
                    border: 0,
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    borderRadius: "10px",
                }}
            />
        )}

        {directLink && isEmbeddableIframeUrl(source) && (
            <iframe
                title={title}
                src={iframeSource}
                style={{
                    border: 0,
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
                allowFullScreen={true}
                allow='encrypted-media; autoplay; clipboard-write; picture-in-picture'
            />
        )}

        {showOtpPlayer && (
                <iframe
                 title={title}
                 src={`https://player.vdocipher.com/v2/?otp=${videoData?.otp}&playbackInfo=${videoData.playbackInfo}&player=48WmoWnrXpDM04cy`}
                  style={{
                    border: 0,
                    width: "100%",
                    height: "100%", 
                    position: "absolute",
                    top: 0,
                    left:0,
                  }}
                  allowFullScreen={true}
                  allow='encrypted-media'
               ></iframe>
        )}

        {showError && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/5 text-black dark:text-white">
                Video is not available right now.
            </div>
        )}
    </div>
  )
}

export default CoursePlayer;