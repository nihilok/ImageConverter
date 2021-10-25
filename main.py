import io

from fastapi import FastAPI, UploadFile, Depends, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ['*']


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def index():
    return FileResponse('./img-converter-react/public/index.html')


class ImageUpload(BaseModel):
    ext: str
    image: UploadFile = File(...)


@app.post('/convert')
async def convert_image(ext: str = Form(...), image: UploadFile = File(...)):
    image_file = image.file.read()
    pil_image = Image.open(io.BytesIO(image_file))
    pil_image = pil_image.convert('RGB')
    (new_x, new_y) = pil_image.size
    pil_image.resize((int(new_x * .8), int(new_y * .8)), resample=Image.BOX)
    with io.BytesIO() as output:
        pil_image.save(output, format=ext)
        output_io = io.BytesIO(output.getvalue())
    return StreamingResponse(output_io, media_type=f"image/{ext}")

