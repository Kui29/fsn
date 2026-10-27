import {Image} from "@nextui-org/react";

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i;

// Shows an uploaded photo, or a playable video when the link points to a video file
export function MediaView({url, alt, className}: {url?: string | null; alt: string; className?: string}) {
	if (!url) return null;
	if (VIDEO_EXTENSIONS.test(url)) {
		return <video src={url} controls preload="metadata" className={className} aria-label={alt}/>;
	}
	return <Image removeWrapper src={url} alt={alt} className={className}/>;
}
