const { api } = require("services/api")

const updateOrder = async (order = {
    Id: '',
    Supplier: '',
    "Date": Date.now(),
    Country: '',
    Invoice: '',
    Shipping: '',
    ETD: Date.now(),
    ETA: Date.now(),
    BL: '',
    Docs: '',
    Payment: '',
    Status: '',
    Note: '',
    UpdateTime: Date.now(),
    UpdateBy: '' 
}) => {
    const res = await api.post('/order', order)
    return res.data
}

const getOrders = async () => {
    const res = await api.get('/orders')
    return res.data
}

const deleteOrder = async (orderId) => {
    const res = await api.delete(`/order/${orderId}`)
    return res.data
}

const ImportManagementController = {
    updateOrder,
    getOrders,
    deleteOrder,
}

export default ImportManagementController