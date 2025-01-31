import { useLoaderData, useOutletContext } from '@remix-run/react';
import { Editor } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedTextOnEditor, textInfo } from '~/states';
import { v4 as uuidv4 } from 'uuid';
import { Button, TextArea } from '~/component/UI';
import { AudioPlayer, AudioRecorder } from '~/features/Media';
import { PostType } from '~/model/type';
import TiptapInstance from '~/component/UI/TiptapInstance';
type FormWithAudioProps = {
  fetcher: any;
  type: 'post' | 'update';
  post: PostType | null;
  onClose?: () => void | null;
};
export function FormWithAudio({ fetcher, type, post, onClose = () => {} }: FormWithAudioProps) {
  let content = post?.content ?? '';
  let audioUrl = post?.audioUrl ?? '';
  const [audio, setAudio] = useState({ tempUrl: audioUrl, blob: null });
  const { name: textName } = useRecoilValue(textInfo);

  const [body, setBody] = useState(content);
  const [error, setError] = useState('');
  const [selection, setSelection] = useRecoilState(selectedTextOnEditor);
  const data = useLoaderData();
  let isFormEmpty = body.length < 5 || body==='<p></p>';
  const { editor }: { editor: Editor } = useOutletContext();
  
  useEffect(() => {
    setBody(content ? content : '');
    setAudio({ tempUrl: audioUrl ? audioUrl : '', blob: null });
    setError('');
  }, [selection.start]);
  function validator() {
    let lengthOfSelection = selection.end - selection?.start;
    let errormessage = '';
    if (audio.tempUrl !== '' && isFormEmpty) {
      errormessage = 'ERROR : describe the audio';
    } else if (isFormEmpty) {
      errormessage = 'ERROR : write more than 5 character';
    } else if (lengthOfSelection > 254) {
      errormessage = 'ERROR : selecting more than 255 letter not allowed';
    } else if (body.length > 250) {
      errormessage = 'ERROR : content more than 255 letter not allowed';
    } else {
      errormessage = '';
    }
    return errormessage;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    let errormessage = validator();
    if (errormessage && errormessage !== '') {
      setError(errormessage);
      return null;
    }
    let id = null;
    if (!editor.isActive('post')) {
      id = uuidv4();
    } else {
      id = editor.getAttributes('post')?.id;
    }
    let item = {
      threadId: id,
      selectionSegment: selection.content,
      textId: data?.text?.id,
      pageId: data?.page?.id,
      order: data?.page?.order,
      topic: textName,
      body: body,
      type: selection.type,
    };
    let blob = audio?.blob;
    var form_data = new FormData();
    if (blob) {
      form_data.append('file', blob, `text-${data?.text?.id}-${uuidv4()}.wav`);
    } else {
      form_data.append('audioUrl', audio.tempUrl);
    }
    if (type === 'update') {
      form_data.append('body', body);
      form_data.append('action', 'update');
      form_data.append('postId', post?.id!);
      let responseData = await fetcher.submit(form_data, {
        method: 'PATCH',
        action: '/api/post',
        encType: 'multipart/form-data',
      });
      if (responseData) onClose();
      return responseData;
    } else {
      for (var key in item) {
        form_data.append(key, item[key]);
      }
      if (selection) {
        let awaitdata = await fetcher.submit(form_data, {
          method: 'POST',
          action: '/api/post',
          encType: 'multipart/form-data',
        });
        if (!awaitdata?.message) {
          setSelection({ ...selection, type: '' });
          editor.commands.setPost({
            id,
          });
        }
      }
    }
  }
  return (
    <fetcher.Form className="flex flex-col gap-3 ">
      <TiptapInstance placeholder="what are your thoughts?" value={body} onChange={(value: string) => setBody(value)} />
      {audio.tempUrl !== '' ? (
        <>
          <div className="flex w-full items-center gap-3 ">
            <AudioPlayer src={audio.tempUrl} />
            <div onClick={() => setAudio({ tempUrl: '', blob: null })}>
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 2C8.81434 2.0001 8.63237 2.05188 8.47447 2.14955C8.31658 2.24722 8.18899 2.38692 8.106 2.553L7.382 4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6C16.2652 6 16.5196 5.89464 16.7071 5.70711C16.8946 5.51957 17 5.26522 17 5C17 4.73478 16.8946 4.48043 16.7071 4.29289C16.5196 4.10536 16.2652 4 16 4H12.618L11.894 2.553C11.811 2.38692 11.6834 2.24722 11.5255 2.14955C11.3676 2.05188 11.1857 2.0001 11 2H9ZM7 8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7C8.26522 7 8.51957 7.10536 8.70711 7.29289C8.89464 7.48043 9 7.73478 9 8V14C9 14.2652 8.89464 14.5196 8.70711 14.7071C8.51957 14.8946 8.26522 15 8 15C7.73478 15 7.48043 14.8946 7.29289 14.7071C7.10536 14.5196 7 14.2652 7 14V8ZM12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8V14C11 14.2652 11.1054 14.5196 11.2929 14.7071C11.4804 14.8946 11.7348 15 12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8946 14.5196 13 14.2652 13 14V8C13 7.73478 12.8946 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7Z"
                  className="fill-gray-200"
                />
              </svg>
            </div>
          </div>
        </>
      ) : null}
      {error && error !== '' && <div className="font-sm text-red-500">{error}</div>}
      {fetcher.data?.message && <div className="font-sm text-red-500">{fetcher.data?.message}</div>}
      <div className="flex items-center justify-between">
        {audio.tempUrl === '' ? <AudioRecorder setAudio={setAudio} /> : <div />}

        <div className="flex justify-end gap-2">
          <Button
            type="reset"
            onClick={() => {
              setAudio({ tempUrl: '', blob: null });
              setSelection({ ...selection, type: '' });
              onClose();
            }}
            style={{ borderRadius: 24 }}
            label="cancel"
          />
          <Button style={{ borderRadius: 24, opacity: isFormEmpty?0.3:1 }} disabled={isFormEmpty} onClick={handleSubmit} type="submit" label="Respond" />
        </div>
      </div>
    </fetcher.Form>
  );
}

export default FormWithAudio;
