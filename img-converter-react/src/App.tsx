import React, {FormEvent} from 'react';

function App() {

    interface iFormState {
        file: File | null;
        ext: string;
    }

    const [formState, setFormState] = React.useState<iFormState>({
        file: null,
        ext: ''
    });

    const onChange = (event: FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement
        setFormState(p => ({
            ...p,
            [target.name]: target.value
        }))
    }

    const onFileChange = (event: FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement
        const file = target.files ? target.files[0] as File : null
        setFormState(p => ({
            ...p,
            file: file
        }))
    }

    const parseFilename = () => {
        let fileName = formState.file?.name ?? 'image.image'
        let fileNameArr = fileName.split('.')
            .slice(0, fileName.split('.').length - 1)
        fileNameArr.push(formState.ext)
        return fileNameArr.join('.')
    }

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!formState.file || !formState.ext.length) return;
        let formData = new FormData();
        console.group("File Submit/Download");
        console.log(`Before size: ${formState.file?.size}`);
        formData.append('ext', formState.ext ?? '');
        formData.append('image', formState.file, formState.file.name);
        await fetch(`/convert`, {
            method: 'post',
            body: formData,
        }).then(res => res.blob().then(data => {
                if (res.status === 200) {
                    console.log(`After size: ${data.size}`)
                    const url = window.URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = parseFilename();
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                } else if (res.status === 400) {
                    setFormState(p => ({
                        ...p,
                        ext: 'Invalid File Extension'
                    }));
                } else {
                    console.error(res);
                }
            }
        )).catch(err => {
            console.error(err);
        });
        console.groupEnd();
    }

    return (
        <div className="App">
            <form onSubmit={onSubmit} className={'form'}>
                <h1>Convert Image:</h1>
                <div className='form-control'>
                    <label htmlFor={'file'}>Image File: </label>
                    <input onChange={onFileChange}
                           type="file" name="file"
                           id="file"/>
                </div>
                <div className='form-control'>
                    <label htmlFor={'ext'}>Extension: </label>
                    <input onChange={onChange}
                           type="ext" name="ext"
                           id="ext"/>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    {formState.ext.length > 5 &&
                    <small style={{color: 'firebrick'}}>'Invalid File Extension'</small>}
                    <input type="submit" value="Convert" disabled={formState.ext.length > 5}/>
                </div>
            </form>
        </div>
    );
}

export default App;
