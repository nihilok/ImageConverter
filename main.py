import io

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
from starlette.staticfiles import StaticFiles

app = FastAPI()


@app.post("/convert")
async def convert_image(ext: str = Form(...), image: UploadFile = File(...)):
    try:
        image_file = image.file.read()
        pil_image = Image.open(io.BytesIO(image_file))
        pil_image = pil_image.convert("RGB")
        new_size = (int(x * 0.9) for x in pil_image.size)
        pil_image = pil_image.resize(new_size, resample=Image.ANTIALIAS)
        with io.BytesIO() as output:
            pil_image.save(output, format=ext, optimize=True)
            output_io = io.BytesIO(output.getvalue())
        return StreamingResponse(output_io, media_type=f"image/{ext}")
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid File Extension")


app.mount(
    "/", StaticFiles(directory="./img-converter-react/build", html=True), name="public"
)
