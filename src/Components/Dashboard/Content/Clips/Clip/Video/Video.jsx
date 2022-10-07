import { useEffect, useRef, useState } from 'react'
import './Video.css'

export default function Video({ end, file, formatTime, start }) {
	const mediaRef = useRef()

	const [fileURL, setFileURL] = useState()
	const [isPlaying, setIsPlaying] = useState(false)
	const [showControls, setShowControls] = useState(false)
	const [time, setTime] = useState(0)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (mediaRef && mediaRef.current) mediaRef.current.currentTime = start / 1000
	}, [mediaRef])

	useEffect(() => {
		if (file) setFileURL(URL.createObjectURL(file) + `#t=${start / 1000}`)
	}, [file])

	useEffect(() => {
		let timer
		if (isPlaying) {
			timer = setInterval(() => {
				console.log('Interval')
				setTime(mediaRef.current?.currentTime - start / 1000)
				setProgress(((mediaRef.current?.currentTime * 1000 - start) / (end - start)) * 100)

				if (mediaRef.current?.currentTime * 1000 >= end) {
					mediaRef.current.pause()
					setIsPlaying(false)
				}
			}, 50)
		} else {
			clearInterval(timer)
		}

		return () => clearInterval(timer)
	}, [isPlaying])

	function back() {
		mediaRef.current.currentTime = Math.max(start / 1000, mediaRef.current.currentTime - 5)
		setTime(mediaRef.current.currentTime - start / 1000)
		setProgress(((mediaRef.current?.currentTime * 1000 - start) / (end - start)) * 100)
	}

	function forward() {
		mediaRef.current.currentTime = Math.min(end / 1000, mediaRef.current.currentTime + 5)
		setTime(mediaRef.current.currentTime - start / 1000)
		setProgress(((mediaRef.current?.currentTime * 1000 - start) / (end - start)) * 100)
	}

	function handleProgressBar(e) {
		const rect = e.currentTarget.getBoundingClientRect()
		const decimal = (e.clientX - rect.left) / (rect.right - rect.left)

		mediaRef.current.currentTime = (start + decimal * (end - start)) / 1000
		setTime((decimal * (end - start)) / 1000)
		setProgress(decimal * 100)
	}

	function handleVideo() {
		if (!isPlaying) mediaRef.current.play()
		else mediaRef.current.pause()
		setIsPlaying(!isPlaying)
	}

	function renderFile() {
		if (file.type.includes('video')) {
			return <video id='media' onClick={handleVideo} ref={mediaRef} src={fileURL} />
		} else if (file.type.includes('audio')) {
			return <audio id='media' onClick={handleVideo} ref={mediaRef} src={fileURL} />
		}
	}

	return file ? (
		<div className='Video' onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
			{renderFile()}
			<div className='controlsContainer' style={showControls ? { opacity: 1 } : { opacity: 0 }}>
				<div className='controls'>
					<svg
						className='controlsIcon'
						onClick={back}
						width='48'
						height='48'
						viewBox='0 0 48 48'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M9 26.7931C9 29.7939 9.87973 32.7273 11.528 35.2224C13.1762 37.7175 15.5189 39.6622 18.2597 40.8106C21.0006 41.9589 24.0166 42.2594 26.9263 41.674C29.8361 41.0885 32.5088 39.6435 34.6066 37.5216C36.7044 35.3997 38.133 32.6962 38.7118 29.7531C39.2905 26.8099 38.9935 23.7593 37.8582 20.9869C36.7229 18.2145 34.8003 15.8449 32.3335 14.1777C29.8668 12.5105 26.9667 11.6207 24 11.6207H18V19.2069L9 10.1034L18 1V8.58621H24C27.5601 8.58621 31.0402 9.65402 34.0003 11.6546C36.9603 13.6552 39.2674 16.4987 40.6298 19.8256C41.9922 23.1525 42.3487 26.8133 41.6541 30.3451C40.9596 33.8769 39.2453 37.121 36.7279 39.6673C34.2106 42.2136 31.0033 43.9476 27.5116 44.6502C24.02 45.3527 20.4008 44.9921 17.1117 43.6141C13.8226 42.236 11.0114 39.9024 9.03355 36.9083C7.05568 33.9142 6 30.3941 6 26.7931H9Z'
							fill='white'
						/>
						<path
							d='M27.8699 23.37H22.6949L22.4999 27.225C22.6177 26.9931 22.7478 26.7678 22.8899 26.55C23.0273 26.3509 23.1942 26.1739 23.3849 26.025C23.5846 25.8748 23.8075 25.7583 24.0449 25.68C24.337 25.5946 24.6405 25.5541 24.9449 25.56C25.4157 25.554 25.8836 25.6354 26.3249 25.8C26.7425 25.957 27.1212 26.2027 27.4349 26.52C27.7606 26.8501 28.0158 27.2431 28.1849 27.675C28.3679 28.1537 28.4595 28.6625 28.4549 29.175C28.4629 29.7232 28.3662 30.268 28.1699 30.78C27.9884 31.2543 27.7071 31.684 27.3449 32.04C26.9648 32.4083 26.5093 32.6897 26.0099 32.865C25.4296 33.08 24.8135 33.1818 24.1949 33.165C23.7198 33.1691 23.2461 33.1137 22.7849 33C22.395 32.8906 22.0216 32.7292 21.6749 32.52C21.3685 32.3363 21.0906 32.1089 20.8499 31.845C20.6223 31.5875 20.4166 31.3116 20.2349 31.02L21.8249 29.805L22.2299 30.42C22.3766 30.6118 22.5481 30.7833 22.7399 30.93C22.9368 31.0722 23.1543 31.1835 23.3849 31.26C23.6502 31.3503 23.9298 31.391 24.2099 31.38C24.4839 31.4017 24.7594 31.3647 25.0181 31.2716C25.2767 31.1785 25.5125 31.0314 25.7099 30.84C26.0624 30.4227 26.2398 29.8851 26.2049 29.34V29.25C26.2255 28.9933 26.1899 28.7352 26.1005 28.4936C26.0111 28.2521 25.87 28.033 25.6872 27.8516C25.5044 27.6703 25.2842 27.5309 25.042 27.4434C24.7998 27.3559 24.5414 27.3223 24.2849 27.345C23.8822 27.3254 23.4821 27.419 23.1299 27.615C22.8601 27.7702 22.617 27.9677 22.4099 28.2L20.6249 27.945L21.0599 21.48H27.8399L27.8699 23.37Z'
							fill='white'
						/>
					</svg>
					{isPlaying ? (
						<svg
							onClick={handleVideo}
							className='controlsIcon--small'
							height='512px'
							id='Layer_1'
							version='1.1'
							viewBox='0 0 512 512'
							width='512px'
						>
							<g>
								<path
									fill='#fff'
									d='M224,435.8V76.1c0-6.7-5.4-12.1-12.2-12.1h-71.6c-6.8,0-12.2,5.4-12.2,12.1v359.7c0,6.7,5.4,12.2,12.2,12.2h71.6   C218.6,448,224,442.6,224,435.8z'
								/>
								<path
									fill='#fff'
									d='M371.8,64h-71.6c-6.7,0-12.2,5.4-12.2,12.1v359.7c0,6.7,5.4,12.2,12.2,12.2h71.6c6.7,0,12.2-5.4,12.2-12.2V76.1   C384,69.4,378.6,64,371.8,64z'
								/>
							</g>
						</svg>
					) : (
						<svg
							onClick={handleVideo}
							className='controlsIcon--small'
							width='39'
							height='45'
							viewBox='0 0 39 45'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M36.8058 25.8545L6.18381 43.6223C3.58506 45.1286 0.25 43.3046 0.25 40.268V4.73246C0.25 1.70058 3.58025 -0.128165 6.18381 1.38296L36.8058 19.1507C37.3969 19.4882 37.8883 19.976 38.2301 20.5647C38.5719 21.1533 38.7519 21.8219 38.7519 22.5026C38.7519 23.1833 38.5719 23.8519 38.2301 24.4406C37.8883 25.0292 37.3969 25.517 36.8058 25.8545Z'
								fill='white'
							/>
						</svg>
					)}
					<svg
						className='controlsIcon'
						onClick={forward}
						width='48'
						height='48'
						viewBox='0 0 48 48'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M39 27C39 29.9667 38.1203 32.8668 36.4721 35.3335C34.8238 37.8003 32.4812 39.7229 29.7403 40.8582C26.9994 41.9935 23.9834 42.2906 21.0737 41.7118C18.1639 41.133 15.4912 39.7044 13.3934 37.6066C11.2956 35.5088 9.86701 32.8361 9.28823 29.9264C8.70945 27.0166 9.0065 24.0006 10.1418 21.2597C11.2771 18.5189 13.1997 16.1762 15.6665 14.528C18.1332 12.8797 21.0333 12 24 12H30V19.5L39 10.5L30 1.5V9H24C20.4399 9 16.9598 10.0557 13.9997 12.0335C11.0397 14.0114 8.73255 16.8226 7.37018 20.1117C6.0078 23.4008 5.65134 27.02 6.34587 30.5116C7.04041 34.0033 8.75474 37.2106 11.2721 39.7279C13.7894 42.2453 16.9967 43.9596 20.4884 44.6541C23.98 45.3487 27.5992 44.9922 30.8883 43.6298C34.1774 42.2674 36.9886 39.9603 38.9665 37.0003C40.9443 34.0402 42 30.5601 42 27H39Z'
							fill='white'
						/>
						<path
							d='M27.8701 23.37H22.6951L22.5001 27.225C22.6179 26.9931 22.7481 26.7678 22.8901 26.55C23.0275 26.3509 23.1944 26.1739 23.3851 26.025C23.5849 25.8748 23.8078 25.7583 24.0451 25.68C24.3373 25.5946 24.6408 25.5541 24.9451 25.56C25.416 25.554 25.8839 25.6354 26.3251 25.8C26.7428 25.957 27.1214 26.2027 27.4351 26.52C27.7608 26.8501 28.016 27.2431 28.1851 27.675C28.3682 28.1537 28.4598 28.6625 28.4551 29.175C28.4632 29.7232 28.3665 30.268 28.1701 30.78C27.9887 31.2543 27.7073 31.684 27.3451 32.04C26.965 32.4083 26.5095 32.6897 26.0101 32.865C25.4298 33.08 24.8137 33.1818 24.1951 33.165C23.7201 33.1691 23.2464 33.1137 22.7851 33C22.3952 32.8906 22.0218 32.7292 21.6751 32.52C21.3688 32.3363 21.0908 32.1089 20.8501 31.845C20.6226 31.5875 20.4169 31.3116 20.2351 31.02L21.8251 29.805L22.2301 30.42C22.3768 30.6118 22.5483 30.7833 22.7401 30.93C22.937 31.0722 23.1546 31.1835 23.3851 31.26C23.6504 31.3503 23.9301 31.391 24.2101 31.38C24.4841 31.4017 24.7597 31.3647 25.0183 31.2716C25.277 31.1785 25.5128 31.0314 25.7101 30.84C26.0626 30.4227 26.24 29.8851 26.2051 29.34V29.25C26.2257 28.9933 26.1901 28.7352 26.1007 28.4936C26.0113 28.2521 25.8703 28.033 25.6875 27.8516C25.5046 27.6703 25.2845 27.5309 25.0422 27.4434C24.8 27.3559 24.5416 27.3223 24.2851 27.345C23.8825 27.3254 23.4824 27.419 23.1301 27.615C22.8604 27.7702 22.6173 27.9677 22.4101 28.2L20.6251 27.945L21.0601 21.48H27.8401L27.8701 23.37Z'
							fill='white'
						/>
					</svg>
				</div>
			</div>
			<div>
				<div className='timecontrols' style={showControls ? { opacity: 1 } : { opacity: 0 }}>
					<p className='controlsTime'>{Math.floor(time / 60) + ':' + ('0' + Math.floor(time % 60)).slice(-2)}</p>
					<div className='ProgressBarTarget' onClick={handleProgressBar}>
						<div className='time_progressbarContainer'>
							<div style={{ width: `${progress}%` }} className='time_progressBar'></div>
						</div>
					</div>
					<p className='controlsTime'>{formatTime(end - start)}</p>
				</div>
			</div>
		</div>
	) : null
}
