import React, { useEffect, useState, useRef, useCallback } from 'react'
import ExcelJS from 'exceljs'
import moment from 'moment'
import axios from 'axios'
import TextAreaAutoSize from 'react-textarea-autosize'
import './styles.css'
import _ from 'lodash'
import SelectSearch from 'react-select-search'
import Select from 'react-select'

const api = axios.create({
	// baseURL: 'http://localhost:3001',
	baseURL: 'https://a38b-123-21-86-62.ngrok.io'
})

const CELL_WIDTH_LIST = [0, 100, 200, 200, 200, 200, 300, 300]

const App = () => {
	const filesRef = useRef([])
	const [data, setData] = useState([])
	const [filteredData, setFilteredData] = useState([])
	const [options, setOptions] = useState([])

	const createOptions = useCallback(() => {
		/**
		 * The options array should contain objects.
		 * Required keys are "name" and "value" but you can have and use any number of key/value pairs.
		 */
		if (!data?.length) return
		try {
			// const opts = _.flattenDeep(data.map(item => item.data)).filter(o => o !== null && typeof o !== 'object').map(o => ({label: '' + o, value: '' + o}))
			const opts = _.flattenDeep(data.map(item => item.data)).map(item => ({label: item.description, value: item.description})).filter(opt => opt.value != undefined)
			console.log(' ================= options: ', opts)
			setOptions(opts)
		} catch (e) {
			console.log('=== Exception: ', e)
		}
	}, [data])

	useEffect(() => {
		createOptions()
	}, [data, createOptions])

	const handleChange = (e) => {
		filesRef.current = e.target.files
	}

	const uploadExcelFiles = () => {
		const formData = new FormData()
		for (let i = 0; i < filesRef.current.length; i++) {
			formData.append('files', filesRef.current[i])
		}
		
		api.post('uploadExcelFiles', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}).then(res => {
			getData()
		})
	}

	// const handleImport = () => {
	// 	const wb = new ExcelJS.Workbook()
	// 	const reader = new FileReader()

	// 	reader.readAsArrayBuffer(file)
	// 	reader.onload = () => {
	// 		const buffer = reader.result
	// 		wb.xlsx.load(buffer).then(workbook => {
	// 			console.log(workbook, 'workbook instance')
	// 			// workbook.eachSheet((sheet, id) => {
	// 			// 	sheet.eachRow((row, rowIndex) => {
	// 			// 		console.log(row.values, rowIndex)
	// 			// 	})
	// 			// })
	// 			const startRow = 4
	// 			const d = workbook.worksheets[0].getRows(startRow, workbook.worksheets[0].actualRowCount).map(r => r.values)
	// 			api.post('save', {
	// 				filename: 'test',
	// 				data: d,
	// 			}).then((res) => { alert(JSON.stringify(res)) }).catch(e => alert('error: ' + JSON.stringify(e)))
	// 			setData(d.map(row => {
	// 				row = row.map(cell => ({ editing: false, value: cell }))
	// 				return row
	// 			}))
	// 			console.log('rows: ', d)
	// 		})
	// 	}
	// }

	const handleKeyDown = (event) => {
		if ((event.which == 13)) {
			event.preventDefault();
			return false;
		}
	}

	const getData = useCallback(() => {
		api.get('/getData').then(res => {
			setData(res.data)
			setFilteredData(res.data)
			console.log('============= data: ', res.data)
		})
	}, [])

	useEffect(() => {
		getData()
		// document.addEventListener("keydown", handleKeyDown)

		// return () => {
		// 	document.removeEventListener("keydown", handleKeyDown)
		// }
	}, [])

	const fuzzySearch = useCallback((option) => {
		const dataCopy = _.cloneDeep([...data])
		if (option.value == 'All') {
			setFilteredData([...dataCopy])
			return
		}

		const filtered = dataCopy.map(item => {
			item.data = item.data.filter(row => row.description == option.value)
			return item
		})
		setFilteredData([...filtered])
	}, [data])

	const renderDataHeader = () => {
		return (
			<div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#8eb3ed', marginBottom: 4 }}>
				<div>
					<div style={{ display: 'flex', width: CELL_WIDTH_LIST[1], height: '100%', justifyContent: 'center', borderRight: '5px solid #fff' }}>
						<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>STT</div>
					</div>
				</div>
				<div>
					<div style={{ display: 'flex', width: CELL_WIDTH_LIST[2], height: '100%', justifyContent: 'center', borderRight: '5px solid #fff' }}>
						<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>Ngày phát sinh</div>
					</div>
				</div>
				<div>
					<div style={{ display: 'flex', width: CELL_WIDTH_LIST[3], height: '100%', justifyContent: 'center', borderRight: '5px solid #fff' }}>
						<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>Tên KH/Dự án</div>
					</div>
				</div>
				<div>
					<div style={{ display: 'flex', width: CELL_WIDTH_LIST[4], height: '100%', justifyContent: 'center', borderRight: '5px solid #fff' }}>
						<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>Hãng</div>
					</div>
				</div>
				<div>
					<div style={{ display: 'flex', width: CELL_WIDTH_LIST[5], height: '100%', justifyContent: 'center', borderRight: '5px solid #fff' }}>
						<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>KH của sale</div>
					</div>
				</div>
				<div>
					<div style={{ display: 'flex', width: CELL_WIDTH_LIST[6] + CELL_WIDTH_LIST[7], height: '50%', justifyContent: 'center', borderBottom: '5px solid #fff' }}>
						<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>Tên công việc</div>
					</div>
					<div>
						<div style={{ display: 'flex', flexDirection: 'row', width: CELL_WIDTH_LIST[6] + CELL_WIDTH_LIST[7], height: '50%', justifyContent: 'center' }}>
							<div style={{ display: 'flex', width: CELL_WIDTH_LIST[6], height: '100%', justifyContent: 'center', borderRight: '5px solid #fff' }}>
								<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>Hoàn thành</div>
							</div>
							<div style={{ display: 'flex', width: CELL_WIDTH_LIST[7], height: '100%', justifyContent: 'center' }}>
								<div style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap' }}>Đang xử lý</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div>
			<div style={{ justifyContent: 'center', marginBottom: 8 }}>
				Working {new Date().toLocaleDateString()}
				<input style={{ marginLeft: 50 }} type="file" multiple onChange={handleChange} />
				<button onClick={uploadExcelFiles}>Import</button>
				<span style={{ marginLeft: 30, color: 'pink', fontSize: 24, fontWeight: 'bold'}}>Huế khó ưa !! &#128540; &#128540;</span>
			</div>
			<div>
				{/* {renderDataHeader()} */}
				{/* {data.map(row => (
					<div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#8eb3ed', marginBottom: 4 }}>
						{[1, 2, 3, 4, 5, 6, 7].map((col) => (
							<div>
								<div style={{ display: 'flex', width: CELL_WIDTH_LIST[col], height: '100%', marginRight: 5 }} onDoubleClick={() => {
									if (!row[col]) row[col] = {}
									row[col].editing = true
									setData([...data])
								}}>
									{
										row[col]?.editing ? (
											<TextAreaAutoSize
												style={{ width: '100%', fontSize: 18, lineHeight: '20px', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap', overflow: 'hidden', resize: 'vertical', fontFamily: "Times New Roman" }}
												value={row[col]?.value || ''}
												autoFocus
												onFocus={(event) => { event.target.setSelectionRange(row[col].value?.length, row[col].value?.length) }}
												onBlur={() => {
													row[col].editing = false
													setData([...data])
												}}
												onChange={(event) => {
													const matchNewline = /\r|\n/.test(event.target.value[event.target.value?.length - 1])
													if (matchNewline && col == 7) {
														row[col].value = event.target.value + moment(new Date()).format('DD.MM') + ' '
													} else {
														row[col].value = event.target.value
													}
													setData([...data])
												}}
											/>
										) : (
											<div style={{ fontSize: 18, lineHeight: '20px', paddingTop: 6, paddingBottom: 6, whiteSpace: 'pre-wrap', fontFamily: "Times New Roman" }}>{`${(row[col]?.value && ('' + row[col]?.value).trim()) || ''}`}</div>
										)
									}
								</div>
							</div>
						))}
					</div>
				))} */}

				<div>
					<Select options={[{label: 'All', value: 'All'}, ...options]} placeholder='Search' onChange={fuzzySearch} />
				</div>

				{filteredData.map((item, index) => (
					<div>
						{item.data.length ? (
							<div style={{ marginTop: 32, marginBottom: 16}} key={`file-${index}`}>
								<span style={{ fontWeight: 'bold', textAlign: 'center'}}>===================== Filename: {item.filename} ===================</span>
							</div>
						) : null}
						{(item?.data || []).map((row, rIndex) => (
							<div style={{ paddingTop: 4, paddingBottom: 4, backgroundColor: rIndex % 2 == 0 ? '#d7e8f7' : 'white'}} key={`row-${rIndex}`}>
								{Object.keys(row).map((key, cIndex) => (
									<span style={{padding: 24, paddingTop: 24, paddingBottom: 24}} key={`cell-${cIndex}`}>{'' + typeof row[key] == 'object' ? row[key].result : row[key]}</span>
								))}
							</div>
						))}
					</div>
				))}
			</div>

			{/* <div>
				<video autoPlay loop muted src='https://www.youtube.com/watch?v=rN6nlNC9WQA'>
				</video>
			</div> */}
		</div>
	)
}
export default App