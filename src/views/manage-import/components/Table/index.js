import React, { useCallback, useEffect, useRef, useState } from 'react'
import './styles.css'
import { headerList, dataList, options } from './data'
import DatePicker from '@mui/lab/DatePicker';
import TextField from '@mui/material/TextField';
import { OptionType, TableDataType } from './types'
import DebounceTextField from '../DebounceTextField';
import { Autocomplete, Button } from '@mui/material';
import DebounceTextareaAutosize from '../DebounceTextareaAutosize';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/RemoveCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton';
import moment from 'moment';

const headerListDefault = [...headerList]
const dataListDefault = [...dataList]

const Table = ({headerList = headerListDefault, dataList = dataListDefault, ...props}) => {
    const [width, setWidth] = useState('100%')
    const headerRef = useRef()
    const [data, setData] = useState(dataList)

    useEffect(() => {
        const mappedData = dataList.map(cells => ({cells: cells, editing: false}))
        setData(mappedData)
    }, [dataList])

    useEffect(() => {
        const handleResize = () => {
            if (headerRef.current?.scrollWidth) {
            setWidth(headerRef.current?.scrollWidth)
            }
        }
        
        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [headerList, setWidth])

    const renderHeaderList = useCallback(() => {
        return (
            <div ref={headerRef} className='table-header'>
                <div
                    key={`table-header-item-#`}
                    className='table-header-item'
                >
                    {'#'}
                </div>
                {headerList.map(item => (
                    <div
                        key={`table-header-item-${item.title}`}
                        className='table-header-item'
                        style={{width: item.width}}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        )
    }, [headerList])

    const onClickEditRow = useCallback((rowIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                newData[rowIndex].editing = true
                return newData
            })
        }
    }, [])

    const onClickSaveRow = useCallback((rowIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                newData[rowIndex].editing = false
                return newData
            })
        }
    }, [])

    const onClickDeleteRow = useCallback((rowIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                newData.splice(rowIndex, 1)
                return newData
            })
        }
    }, [])

    const onClickDeleteProduct = useCallback((rowIndex, cellIndex, productIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                if (newData[rowIndex].cells[cellIndex].value) {
                    newData[rowIndex].cells[cellIndex].value.splice(productIndex, 1)
                }
                return newData
            })
        }
    }, [])

    const onClickAddProduct = useCallback((rowIndex, cellIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                if (newData[rowIndex].cells[cellIndex].value) {
                    let productItem = {
                        name: '',
                        amount: 0,
                        unit: 'KG',
                        purity: 0,
                        germination: 0,
                        lot: ''
                    }
                    newData[rowIndex].cells[cellIndex].value.push(productItem)
                }
                return newData
            })
        }
    }, [])

    const renderCell = useCallback((rowIndex, cellIndex) => {
        const cell = data[rowIndex].cells[cellIndex]

        switch (cell.type) {
            case TableDataType.Date:
                if (data[rowIndex].editing) {
                    return (
                        <DatePicker
                            label="Select a date"
                            value={cell.value}
                            onChange={(newValue) => {
                                setData(x => {
                                    let newData = [...x]
                                    newData[rowIndex].cells[cellIndex].value = newValue
                                    return newData
                                })
                            }}
                            renderInput={(params) => <TextField {...params} size='small' />}
                        />
                    )
                }

                return moment(cell.value).format('MM/DD/YYYY')
            case TableDataType.Text:
                if (data[rowIndex].editing) {
                    return (
                        <DebounceTextareaAutosize value={cell.value} onChange={(value) => {
                            setData(x => {
                                let newData = [...x]
                                newData[rowIndex].cells[cellIndex].value = value
                                return newData
                            })
                        }} />
                    )
                }

                return cell.value
            case TableDataType.Select:
                if (data[rowIndex].editing) {
                    return (
                        <Autocomplete
                            options={options[cell.optionType]}
                            getOptionLabel={option => option.name}
                            renderOption={(props, option) => {
                                return (
                                  <span {...props} style={{ color: '#000' }}>
                                    {option.name}
                                  </span>
                                );
                              }}
                            sx={{ width: 200 }}
                            renderInput={(params) => <TextField
                                {...params}
                                label="Select a value"
                                size='small'
                            />}
                        />
                    )
                }

                return cell.value
            case TableDataType.Custom.Product: {
                let cellValues = cell.value || []
                if (data[rowIndex].editing) {
                    return (
                        <div>
                            {cellValues.map((item, valueIndex) => (
                                <div style={{borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.16)', borderStyle: 'solid', borderRadius: 4, padding: 8, marginBottom: 8}}>
                                    <DebounceTextField value={item.name} label='Product name' style={{width: '100%'}} />
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                                        <DebounceTextField type='number' style={{width: '48%'}} label='Amount' />
                                        <Autocomplete
                                            style={{width: '48%'}}
                                            options={options[OptionType.Unit]}
                                            getOptionLabel={option => option.name}
                                            renderOption={(props, option) => {
                                                return (
                                                <span {...props} style={{ color: '#000' }}>
                                                    {option.name}
                                                </span>
                                                );
                                            }}
                                            sx={{ width: 200 }}
                                            renderInput={(params) => <TextField
                                                {...params}
                                                label="Unit"
                                                size='small'
                                            />}
                                        />
                                    </div>
                                    
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                                        <DebounceTextField type='number' style={{width: '48%'}} label='Purity' />
                                        <DebounceTextField type='number' style={{width: '48%', fontSize: 12}} label='Germination' />
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                                        <DebounceTextField value={item.name} label='Lot' style={{width: '48%'}} />
                                        <Button startIcon={<RemoveIcon />} color='error' variant='contained' size='small' onClick={onClickDeleteProduct(rowIndex, cellIndex, valueIndex)}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
    
                            <div style={{marginTop: cellValues.length ? 24 : 0, display: 'flex', width: '100%', justifyContent: 'center'}}>
                                <Button startIcon={<AddIcon />} color='primary' variant='contained' size='small' onClick={onClickAddProduct(rowIndex, cellIndex)}>
                                    Add Product
                                </Button>
                            </div>
                        </div>
                    )
                }

                return cellValues.map(value => value.name).join('\n')
            }
            default: return cell.value
        }
    }, [data, onClickAddProduct, onClickDeleteProduct])

    const renderDataList = useCallback(() => {
        return (
            <div className='table-content'>
                {data.map((row, rowIndex) => (
                    <div key={`table-row-${rowIndex}`} className='table-row'>
                        <div key={`table-cell-#`} className='table-cell' style={{display: 'flex', justifyContent: 'center'}}>
                            {`${rowIndex}`}
                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', marginTop: 16}}>
                                <IconButton size='small' onClick={onClickDeleteRow(rowIndex)}>
                                    <DeleteIcon />
                                </IconButton>
                                {row.editing ? (
                                    <IconButton size='small' onClick={onClickSaveRow(rowIndex)}>
                                        <CheckCircleIcon />
                                    </IconButton>
                                ) : (
                                    <IconButton size='small' onClick={onClickEditRow(rowIndex)}>
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </div>
                        </div>
                        {row?.cells?.map((cell, cellIndex) => (
                            <div
                                key={`table-cell-${cellIndex}`}
                                className='table-cell'
                                style={{width: headerList[cellIndex].width}}
                            >
                                {renderCell(rowIndex, cellIndex)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        )
    }, [data, headerList, onClickDeleteRow, onClickEditRow, onClickSaveRow, renderCell])

    return (
        <div className='table-container' style={{width: width}}>
            {renderHeaderList()}
            {renderDataList()}
        </div>
    )
}
  
export default Table
  