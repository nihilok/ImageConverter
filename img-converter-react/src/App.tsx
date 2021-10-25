import React, {FormEvent} from 'react';
import logo from './logo.svg';
import './App.css';

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

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        let formData = new FormData()
        console.group("File Size")
        console.log(`Before ${formState.file?.size}`)
        formData.append('ext', formState.ext ?? '')
        if (formState.file) {
            formData.append('image', formState.file, formState.file.name)
        }
        console.log(formState)
        await fetch(`http://localhost:8000/convert`, {
            method: 'post',
            body: formData,
        }).then(res => res.blob().then(data => {
                console.log(`After: ${data.size}`)
                const url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // the filename you want
                a.download = (formState.file?.name ?? 'image') + '.' + formState.ext;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        ))
        console.groupEnd()
    }

    return (
        <div className="App">
            <form onSubmit={onSubmit} className={'form'}>
                <h1>Convert Image:</h1>
                <div className='form-control'><label htmlFor={'file'}>Image File: </label><input onChange={onFileChange}
                                                                                                 type="file" name="file"
                                                                                                 id="file"/></div>
                <div className='form-control'><label htmlFor={'ext'}>Extension: </label><input onChange={onChange}
                                                                                               type="ext" name="ext"
                                                                                               id="ext"/></div>
                <input type="submit" value="Upload"/>
            </form>
        </div>
    );
}

export default App;
