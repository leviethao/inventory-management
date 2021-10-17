import React, { useEffect, useState, useRef, useCallback } from 'react'
import ExcelJS from 'exceljs'
import moment from 'moment'
import TextAreaAutoSize from 'react-textarea-autosize'
import './styles.css'
import _ from 'lodash'
import Select, { components } from 'react-select'
import FileManagerModal from './components/Modals/FileManagerModal'
import { api } from './services/api'
import { config } from './config'
import CustomOption from './components/Layouts/CustomOption'
import PageLoading from './components/Layouts/PageLoading'
import Timer from './components/Layouts/Timer'

const CELL_WIDTH_LIST = [0, 100, 200, 200, 200, 200, 300, 300]

const App = () => {
	const filesRef = useRef([])
	const [data, setData] = useState([])
	const [filteredData, setFilteredData] = useState([])
	const [options, setOptions] = useState([])
	const fileManagerModalRef = useRef(null)
	const [productListByCategory, setProductListByCategory] = useState({})
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [loading, setLoading] = useState(true)

	const createOptions = useCallback(() => {
		/**
		 * The options array should contain objects.
		 * Required keys are "name" and "value" but you can have and use any number of key/value pairs.
		 */
		
		try {
			// const opts = _.flattenDeep(data.map(item => item.data)).filter(o => o !== null && typeof o !== 'object').map(o => ({label: '' + o, value: '' + o}))
			// const opts = _.flattenDeep(data.map(item => item.data)).map(item => ({label: item.description, value: item.description})).filter(opt => opt.value != undefined)

			let opts = []
			Object.keys(productListByCategory).forEach(category => {
				productListByCategory[category]?.products?.length && productListByCategory[category].products.forEach(product => {
					opts.push({
						...product,
						label: product.name,
						value: product.name,
						category: category
					})
				})
			})
			setOptions(opts)
		} catch (e) {
			console.log('=== Exception: ', e)
		}
	}, [productListByCategory])

	useEffect(() => {
		createOptions()
	}, [productListByCategory, createOptions])

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
		})
	}, [])

	const getCategoriesURL = useCallback(async () => {
		return new Promise((resolve, reject) => {
			api.get('/crawlHTML', {
				params: {
					url: 'https://greenseeds.net/shop'
				}
			}).then(res => {
				const strHTML = res.data || ''
				const html = document.createElement('html')
				html.innerHTML = strHTML
				const categoryList = html.querySelectorAll('#shop-sidebar .accordion .accordion-item')

				const QUERY_CATETORIES = ['Vegetable seeds', 'Flower seeds']
				const listUrlFiltered = []
				categoryList.forEach(category => {
					const categoryName = category.querySelector('.accordion-title span').innerHTML
					if (QUERY_CATETORIES.includes(categoryName)) {
						const categoryUrlList = category.querySelectorAll('.accordion-inner ul ul.menu li a')
						categoryUrlList.forEach(aTag => listUrlFiltered.push(aTag.href))
					}
				})

				resolve(listUrlFiltered)
			}).catch(e => {
				reject(e)
				console.log('crawlHTML error: ', e)
			})
		})
	}, [])

	const getProductListByCategory = useCallback(async () => {
		const categoryUrlList = await getCategoriesURL()
		if (!categoryUrlList.length) return null

		let categories = {
			// eggplant: {
			// 	products: [

			// 	]
			// }
		}

		let finishCount = 0
		return new Promise((resolve, reject) => {
			categoryUrlList.forEach(url => {
				api.get('/crawlHTML', {
					params: {
						url,
					}
				}).then(res => {
					const strHTML = res.data || ''
					const html = document.createElement('html')
					html.innerHTML = strHTML
					const productList = html.querySelector('.shop-container .products').getElementsByClassName('product-small box')
		
					for (let i = 0; i < productList.length; i++) {
						const productElement = productList.item(i)
						
						const productName = productElement?.querySelector('.title-wrapper .product-title a')
						const strName = productName?.innerHTML || ''
		
						const productImageUrl = productElement?.querySelector('.box-image .image-zoom-fade a img').src
						const productDetailUrl = productElement?.querySelector('.box-image .image-zoom-fade a').href
		
						const product = {
							name: strName,
							imageUrl: productImageUrl,
							detailUrl: productDetailUrl,
						}
	
						const categoryName = url.split('/').pop()
						if (categories[categoryName]) {
							if (categories[categoryName].products) {
								categories[categoryName].products.push(product)
							} else {
								categories[categoryName].products = [product]
							}
						} else {
							categories[categoryName] = {
								products: [product]
							}
						}
					}

					finishCount++
					if (finishCount == categoryUrlList.length) {
						resolve(categories)
					}
				}).catch(e => {
					finishCount++
					if (finishCount == categoryUrlList.length) {
						resolve(categories)
					}
					console.log('catch e: ', e)
				})
			})
		})
	}, [])

	useEffect(() => {
		getData()
		getProductListByCategory().then(productsByCategory => setProductListByCategory(productsByCategory))
		// document.addEventListener("keydown", handleKeyDown)

		// return () => {
		// 	document.removeEventListener("keydown", handleKeyDown)
		// }
	}, [])

	useEffect(() => {
		if (filteredData.length && options.length) {
			setLoading(false)
		}
	}, [filteredData, options])

	const fuzzySearch = useCallback((option) => {
		const dataCopy = _.cloneDeep([...data])
		if (option.value == 'All') {
			setFilteredData([...dataCopy])
			setSelectedProduct(null)
			return
		}

		setSelectedProduct(option)

		const filtered = dataCopy.map(item => {
			item.data = item.data.filter(row => (row.description || '').toLowerCase().trim().includes((option.value || '').toLowerCase().trim().split(' ')[0]))
			return item
		})
		
		// Check if has accurate result
		for (const item of filtered) {
			for (const row of item.data) {
				if ((row.description || '').toLowerCase().trim() == (option.value || '').toLowerCase().trim()) {
					item.data = [row]
					setFilteredData([item])
					return
				}
			}
		}

		// List of result
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
		<div id='app-container'>
			<div style={{ justifyContent: 'center', marginBottom: 8 }}>
				Working <Timer />
				<input style={{ marginLeft: 50 }} type="file" multiple onChange={handleChange} />
				<button onClick={uploadExcelFiles}>Import</button>
				<button
					onClick={() => fileManagerModalRef.current?.setVisible(true)}
					style={{ marginLeft: 16 }}
				>
					File Manager
				</button>
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

				<div style={{marginBottom: 32, marginTop: 16}}>
					<Select
						styles={{
							option: (provided, state) => ({
								...provided,
								color: state.isSelected ? 'green' : 'black',
								backgroundColor: 'rgba(252, 159, 203, 0.3)'
							}),
						}} 
						options={[{label: 'All', value: 'All'}, ...options]} placeholder='Search' onChange={fuzzySearch}
						components={{Option: CustomOption}}
					/>
				</div>

				<div style={{display: 'flex', flexDirection: 'row', height: selectedProduct ? '74vh' : '76vh'}}>
					{selectedProduct ? (
						<div style={{display: 'flex', flexDirection: 'column', flex: 1, height: '100%'}}>
							<div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}><h2>Product Detail</h2></div>
							<iframe
								src={selectedProduct.detailUrl}
								title="Product Detail"
								style={{flex: 1, background: 'transparent'}}
								frameBorder={0}
								allowTransparency={true}
							></iframe>
						</div>
					) : null}
					<div style={{ flex: 2, height: '100%' }}>
						{selectedProduct ? (<div style={{ display: 'flex', width: '100%', height: '13%', justifyContent: 'center' }}><h2>Corresponding Scientific Name</h2></div>) : null}
						<div style={{display: 'flex', flexDirection: 'column', height: selectedProduct ? '87%' : '100%', overflowY: 'scroll'}}>
							{(filteredData.find(t => t?.data && t?.data.length)) ? filteredData.map((item, index) => (
								<div>
									{item.data.length ? (
										<div style={{ marginTop: 32, marginBottom: 16, display: 'flex', justifyContent: 'center'}} key={`file-${index}`}>
											<span style={{ fontWeight: 'bold', textAlign: 'center'}}>===================== Filename: {item.filename} =====================</span>
										</div>
									) : null}
									{(item?.data || []).map((row, rIndex) => (
										<div style={{ display: 'flex', flexDirection: 'row', paddingTop: 4, paddingBottom: 4, backgroundColor: rIndex % 2 == 0 ? 'rgba(215, 232, 247, 0.3)' : 'rgba(255, 255, 255, 0.3)'}} key={`row-${rIndex}`}>
											{Object.keys(row).map((key, cIndex) => (
												<div
													style={{
														padding: 24,
														paddingTop: 24,
														paddingBottom: 24,
														minWidth: cIndex == 0 ? 30: 350,
														// backgroundColor: 'red',
														// borderRight: '2px solid #fff',
														display: 'flex',
														justifyContent: cIndex == 0 ? 'center' : 'flex-start'
													}} 
													key={`cell-${cIndex}`}
												>
													{'' + typeof row[key] == 'object' ? row[key].result : row[key]}
												</div>
											))}
										</div>
									))}
								</div>
							)) : (
								<div style={{ display: 'flex', width: '100%', justifyContent: 'center', color: '#888' }}><h2>Empty Data</h2></div>
							)}
						</div>
					</div>
				</div>
			</div>

			<video autoPlay loop muted style={{
				position: 'fixed',
				right: 0,
				bottom: 0,
				minWidth: '100%',
				minHeight: '100%',
				zIndex: -1,
			}}>
				<source src={`${config.API_URL}/videos/pink-flower.mp4`} type="video/mp4" />
			</video>

			<FileManagerModal ref={fileManagerModalRef} />
			
			{loading && <PageLoading />}
		</div>
	)
}
export default App