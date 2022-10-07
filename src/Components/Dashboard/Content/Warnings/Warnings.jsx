import './Warnings.css'

function formatTime(milliseconds) {
	let time = new Date(milliseconds).toISOString()

	if (milliseconds < 600000) return time.slice(15, 19)
	if (milliseconds < 3600000) return time.slice(14, 19)
	if (milliseconds < 36000000) return time.slice(12, 19)
	return time.slice(11, 19)
}

export default function Warnings({ file, results, setFile }) {
	return (
		<table className='Warnings'>
			<caption>
				<div className='Title'>Warnings {file?.name && `- ${file.name}`}</div>
			</caption>
			<thead>
				<tr>
					<th>WARNING</th>
					<th>TRANSCRIPT</th>
					<th className='Right'>DURATION</th>
					<th className='Right'>START</th>
					<th className='Right'>END</th>
				</tr>
			</thead>
			<tbody>
				{results?.content_safety_labels?.results?.map(({ text, labels, timestamp }, index) => (
					<tr key={`Warning ${index}`}>
						<td className='Labels'>{labels.map(({ label }) => label.replace(/_/g, ' ')).join(`, \n`)}</td>
						<td className='Break'>{text}</td>
						<td className='Right'>{formatTime(timestamp.end - timestamp.start)}</td>
						<td className='Right'>{formatTime(timestamp.start)}</td>
						<td className='Right'>{formatTime(timestamp.end)}</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
