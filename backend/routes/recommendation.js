const express = require("express")
const router = express.Router()

const { getRecommendations } = require("../services/recommendationService")

router.get("/recommend/:productId", async (req, res) => {
  try {

    const productId = req.params.productId
    const userId = null   // 👈 TEMP FIX

    const recs = await getRecommendations(userId, productId)

    res.json(recs)

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Recommendation error"
    })
  }
})

module.exports = router