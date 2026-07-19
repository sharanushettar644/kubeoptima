import logging

logger = logging.getLogger(__name__)

class DummyModel:
    def __init__(self, name: str):
        self.name = name

    def predict(self, *args, **kwargs):
        return {"prediction": 0.0}

class ModelRegistry:
    def __init__(self):
        self._models = {}
        self.loaded_count = 0
        self.all_loaded = False

    async def load_all(self):
        logger.info("Loading all ML models...")
        self._models = {
            "forecast_lstm": DummyModel("lstm"),
            "forecast_prophet": DummyModel("prophet"),
            "forecast_xgboost": DummyModel("xgboost"),
            "forecast_transformer": DummyModel("transformer"),
            "forecast_ensemble": DummyModel("ensemble"),
        }
        self.loaded_count = len(self._models)
        self.all_loaded = True
        logger.info("All ML models loaded successfully.")

    async def unload_all(self):
        logger.info("Unloading all ML models...")
        self._models.clear()
        self.loaded_count = 0
        self.all_loaded = False
        logger.info("All ML models unloaded.")

    def get(self, name: str):
        return self._models.get(name) or DummyModel(name)

model_registry = ModelRegistry()
