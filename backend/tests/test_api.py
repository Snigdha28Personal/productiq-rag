import pytest
import httpx
from backend.main import app

@pytest.mark.anyio
async def test_root_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["app"] == "ProductIQ — AI Product Research Copilot"
        assert "tagline" in data

@pytest.mark.anyio
async def test_status_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.get("/api/status")
        assert res.status_code == 200
        data = res.json()
        assert "embedding_mode" in data
        assert "active_similarity_threshold" in data

@pytest.mark.anyio
async def test_demo_load_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.post("/api/demo/load")
        assert res.status_code == 200
        data = res.json()
        assert "documents" in data
        assert len(data["documents"]) > 0

@pytest.mark.anyio
async def test_query_endpoint_grounded():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        await client.post("/api/demo/load")
        res = await client.post("/api/query", json={"query": "What are the top onboarding friction points?"})
        assert res.status_code == 200
        data = res.json()
        assert "key_finding" in data
        assert "citations" in data
        assert not data["is_insufficient_evidence"]

@pytest.mark.anyio
async def test_query_endpoint_insufficient_evidence():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        await client.delete("/api/clear")
        res = await client.post("/api/query", json={"query": "What is the capital of Mars?"})
        assert res.status_code == 200
        data = res.json()
        assert data["is_insufficient_evidence"]
        assert "couldn't find enough evidence" in data["key_finding"]

@pytest.mark.anyio
async def test_insights_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.get("/api/insights")
        assert res.status_code == 200
        data = res.json()
        assert "top_pain_points" in data
        assert "customer_segments" in data

@pytest.mark.anyio
async def test_analytics_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.get("/api/analytics")
        assert res.status_code == 200
        data = res.json()
        assert "questions_asked" in data
