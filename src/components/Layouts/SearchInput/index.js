import React, { useCallback, useEffect, useState } from 'react'
import { api } from '../../../services/api'
import './styles.scss'
import _ from 'lodash'

const SearchInput = ({ onSelect = (product) => {} }) => {
	// const [search, setSearch] = useState('')
	const [suggestions, setSuggestions] = useState([])
	const [showResultBox, setShowResultBox] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleChangeText = useCallback(_.debounce((text) => {
		searchProduct(text).then(sugs => setSuggestions(sugs))
	}, 800), [])

	const onChange = useCallback((e) => handleChangeText(e.target.value), [])

	const searchProduct = useCallback((text) => {
		setLoading(true)
		return new Promise((resolve, reject) => {
			api.get('/crawlData', {
				params: {
					url: `https://greenseeds.net/wp-admin/admin-ajax.php?action=flatsome_ajax_search_products&query=${text}`
				}
			}).then(res => {
				resolve(res.data.suggestions)
				setLoading(false)
			}).catch(e => {
				console.log('Search error: ', e)
				reject(e)
				setLoading(false)
			})
		})
	}, [])

	const onFocus = useCallback(() => {
		setShowResultBox(true)
	}, [])

	const onBlur = useCallback(() => {
		setShowResultBox(false)
	}, [])

	const onSelectItem = useCallback((item) => () => {
		onSelect && onSelect(item)
		onBlur()
	}, [onSelect])

	return (
		<div className='search-container' onFocus={onFocus}>
			<div style={{ padding: 8, background: '#fff', borderRadius: 4 }} className='search-input-wrapper'>
				<input
					type='text'
					className='search-input'
					placeholder='Search products'
					onChange={onChange}
				/>
			</div>
			<div className='result-list' style={{ display: showResultBox ? 'block' : 'none' }}>
				{[{value: 'All', img: ''}, ...suggestions].map(product => (
					<div className='item' onClick={onSelectItem(product)}>
						<div style={{ borderRadius: 8, overflow: 'hidden' }}>
							<img src={product.img} style={{ width: 50, height: 50 }} />
						</div>
						<div style={{ marginLeft: 24, fontSize: 20 }}>{product.value}</div>
					</div>
				))}
				{loading && (
					<img key={`search-loading`} src='cute-loading.gif' style={{ width: 100, height: 100, position: 'absolute', left: '50%', top: '50%', marginRight: '-50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)'}} />
				)}
			</div>
		</div>
	)
}

export default SearchInput