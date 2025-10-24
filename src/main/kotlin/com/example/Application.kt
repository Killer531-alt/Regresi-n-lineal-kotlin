package com.example

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.server.http.content.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Point(val x: Double, val y: Double)

@Serializable
data class RegressionResult(val m: Double, val b: Double, val equation: String)

fun calculateLinearRegression(points: List<Point>): RegressionResult {
    val n = points.size
    require(n >= 2) { "Se requieren al menos 2 puntos para calcular la regresión lineal." }

    val sumX = points.sumOf { it.x }
    val sumY = points.sumOf { it.y }
    val sumXY = points.sumOf { it.x * it.y }
    val sumX2 = points.sumOf { it.x * it.x }

    val numerator = n * sumXY - sumX * sumY
    val denominator = n * sumX2 - sumX * sumX

    if (denominator == 0.0) {
        throw IllegalArgumentException("La varianza de X es cero; no se puede calcular la pendiente.")
    }

    val m = numerator / denominator
    val b = (sumY - m * sumX) / n
    val equation = "y = %.4fx + %.4f".format(m, b)
    return RegressionResult(m, b, equation)
}

fun main() {
    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            json(Json { prettyPrint = true })
        }

        routing {
            static("/") {
                resources("static")
                defaultResource("static/index.html")
            }

            post("/api/regression") {
                val points = call.receive<List<Point>>()
                try {
                    val result = calculateLinearRegression(points)
                    call.respond(result)
                } catch (e: IllegalArgumentException) {
                    call.respond(mapOf("error" to (e.message ?: "Error")))
                }
            }

            get("/api/health") {
                call.respond(mapOf("status" to "ok"))
            }
        }
    }.start(wait = true)
}
