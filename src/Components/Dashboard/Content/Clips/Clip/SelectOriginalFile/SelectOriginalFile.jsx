import './SelectOriginalFile.css'

export default function SelectOriginalFile({ setFile }) {
	return (
		<label className='SelectOriginalFile'>
			<input
				accept='.3ga,.8svx,.aac,.ac3,.aif,.aiff,.alac,.amr,.ape,.au,.dss,.flac,.flv,.m4a,.m4b,.m4p,.m4r,.mp3,.mpga,.ogg,.oga,.mogg,.opus,.qcp,.tta,.voc,.wav,.wma,.wv,.webm,.MTS,.M2TS,.TS,.mov,.mp2,.mp4,.m4p,.m4v,.mxf'
				onChange={e => (e.target.files[0] !== undefined ? setFile(e.target.files[0]) : null)}
				type='file'
			/>
			Select the Original File
		</label>
	)
}
