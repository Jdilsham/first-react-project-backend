import { or } from "sequelize";

export async function createOrder(req, res) {

    //CBC0000001

    // if(req.user == null) {
    //     return res.status(401).json(
    //         { message: "Unauthorized user" 

    //         }
    //     )
    //     return;
    // }

    try {
        const orderList = await Order.find().sort({ date : -1 }).limit(1);

        let newOrderID = "CBC0000001";

        if(orderList.length !=0) {
            const lastOrderIDInString = orderList[0].orderID; // e.g., "CBC0000001"
            let lastOrderNumberinString = lastOrderIDInString.substring(3); // "0000001"
            let lastOrderNumber = parseInt(lastOrderNumberinString);
            let newOrderNumber = lastOrderNumber + 1;
            newOrderID = "CBC" + newOrderNumber.toString().padStart(7, '0'); // "CBC0000002"
        }

        const newOrder = new Order({
            orderID : newOrderID,
            items: [],
            customerName: req.body.customerName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            total: req.body.total,
            status: 'Pending'
        })

        const savedOrder = await newOrder.save()

        res.status(201).json(
            {
                message: "Order created successfully",
                order: savedOrder
            }
        )
        
    } catch (err) {
        res.status(500).json(
            { message: "Server error", error: err.message }
        )
    }

}