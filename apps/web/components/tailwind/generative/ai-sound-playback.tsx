import { TIMBRE } from '@/lib/language';
import { FaRegCirclePlay } from "react-icons/fa6";
import { FaRegCirclePause } from "react-icons/fa6";
import { useAppSelector } from '@/app/store/hooks';
import { IoDownloadOutline } from "react-icons/io5";
import { setGlobalState } from '@/app/store/globalSlice';
import React, { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ky from 'ky';
import LoadAnimation from '../LoadAnimation';
import { toast } from '../ui/use-toast';
import { ErrMessage } from '@/app/componets/ErrMessage';
import { MdClose } from 'react-icons/md';
import { Loader2 } from 'lucide-react';

const timbreList = [
  { value: 'zh-CN-XiaoxiaoNeural', label: 'Xiaoxiao', gender: 'Female', locale: 'zh-CN' },
  { value: 'en-US-BrianMultilingualNeural', label: 'Brian', gender: 'Male', locale: 'en-US' },
  { value: 'de-DE-SeraphinaMultilingualNeural', label: 'Seraphina', gender: 'Female', locale: 'de-DE' },
  { value: 'fr-FR-RemyMultilingualNeural', label: 'Remy', gender: 'Male', locale: 'fr-FR' },
]
const AudioPlayer = (props: { text: string, full?: boolean, close?: () => void }) => {
  const audioRef = useRef(null);
  const { text, full, close } = props;
  const [duration, setDuration] = useState(0);
  const global = useAppSelector(setGlobalState);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playState, setPlayState] = useState(false);
  const [audioData, setAudioData] = useState({ audioSrc: '', duration: 0 });
  const [audioSpeed, setAudiosSpeed] = useState(1);
  const [selectTimbre, setSelectTimbre] = useState('zh-CN-XiaoxiaoNeural');

  const onGetAudio = async () => {
    setIsLoading(true)
    const { api_key, language, region } = global.payload.global
    // const fetchUrl = `https://test-api.gpt302.com`;
    // const fetchUrl = `https://api.302.ai/`;
    const fetchUrl = process.env.NEXT_PUBLIC_AUDIO_FETCH_URL;
    const item = timbreList.find(f => f.value === selectTimbre);
    const textConet = text.replace(/[#*]/g, '');
    try {
      const resp = await ky.post(`${fetchUrl}/cognitiveservices/v1`, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
        },
        body: `
  <speak version='1.0' xml:lang='${item.locale}'>
    <voice xml:lang='${item.locale}' xml:gender='${item.gender}' name='${item.value}'>
      <prosody rate='1'>
        ${textConet}
      </prosody>
    </voice>
  </speak> `,
        timeout: false,
      });

      const data = await resp.blob();
      if (data.size > 0) {
        const audioSrc = URL.createObjectURL(data);
        const duration = await getAudioDuration(audioSrc);
        setAudioData(() => ({ audioSrc, duration }))
      }
    } catch (error) {
      if (error.response) {
        // 尝试从响应中解析错误信息
        try {
          const errorData = await error.response.json();
          toast({
            duration: 2000,
            description: (ErrMessage(errorData.error.err_code, language, global.payload.global.region))
          })
        } catch (parseError) {
          toast({
            duration: 2000,
            description: (ErrMessage(0, language, global.payload.global.region))
          })
        }
      } else {
        toast({
          duration: 2000,
          description: (ErrMessage(0, language, global.payload.global.region))
        })
      }
    }
    setIsLoading(false)
  }

  const onPlay = async () => {
    if (isLoading) return;
    if (!audioData.audioSrc) {
      await onGetAudio()
      return;
    }
    if (playState) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlayState((v) => !v);
  };

  useEffect(() => {
    if (audioData.audioSrc) {
      audioRef.current.playbackRate = audioSpeed;
      audioRef.current.play();
      setPlayState(true);
    }
  }, [audioData.audioSrc,])

  const handleSpeedChange = (value) => {
    audioRef.current.playbackRate = value;
    setAudiosSpeed(value);
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleLoadedMetadata = () => {
    setDuration(Math.round(audioRef.current.duration));
  };

  const handleTimeUpdate = () => {
    setCurrentTime(Math.round(audioRef.current.currentTime));
  };

  const speedList = [
    { value: '0.5', label: '0.5x' },
    { value: '1', label: '1x' },
    { value: '1.5', label: '1.5x' },
    { value: '2', label: '2x' },
  ]

  // 获取音频时长
  function getAudioDuration(audioSource: string | Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext ||
        // @ts-ignore
        window.webkitAudioContext)();

      let source: string;

      if (typeof audioSource === 'string') {
        // 如果audioSource是URL
        source = audioSource;
      } else if (audioSource instanceof Blob) {
        // 如果audioSource是Blob对象
        source = URL.createObjectURL(audioSource);
      } else {
        reject(new Error('Invalid audio source'));

        return;
      }

      fetch(source)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          const duration = audioBuffer.duration;

          resolve(duration);

          // 如果创建了对象URL，需要释放
          if (audioSource instanceof Blob) {
            URL.revokeObjectURL(source);
          }

          // 关闭AudioContext
          audioContext.close();
        })
        .catch((error) => {
          reject(error);
          if (audioSource instanceof Blob) {
            URL.revokeObjectURL(source);
          }
          audioContext.close();
        });
    });
  }

  // 下载音频
  const onDownload = () => {
    if (!audioData.audioSrc) return;
    const a = document.createElement('a');
    a.href = audioData.audioSrc;
    a.download = `${text?.slice(0, 10)}.mp3`;
    a.click();
  }

  useEffect(() => {
    return () => {
      setAudioData(() => ({ audioSrc: '', duration: 0 }))
    }
  }, [])

  return (
    <div className='p-5 w-full relative'>
      {full && (<MdClose className=" absolute right-0 top-0 cursor-pointer text-2xl" onClick={() => close()} />)}
      <audio
        ref={audioRef}
        className="hidden"
        preload="metadata"
        src={audioData.audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate} // 添加这个事件
        onEnded={() => {
          setPlayState(false)
          setCurrentTime(duration);
        }}
      >
        <track kind="captions" />
      </audio>
      <div className='w-full mb-5 border rounded-sm p-2 mt-2'>
        <input
          className='w-full'
          type="range"
          id="seek"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleTimeChange}
          disabled={!audioData.audioSrc}
        />
      </div>

      <div className='flex justify-between items-center'>
        <div className='flex'>
          <Select defaultValue='1' onValueChange={handleSpeedChange}>
            <SelectTrigger className="w-[100px] mr-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-[9999]'>
              <SelectGroup>
                {speedList.map(item => (<SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={selectTimbre} onValueChange={(value) => { setSelectTimbre(value) }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-[9999]'>
              <SelectGroup>
                {timbreList.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {TIMBRE[item.label][global.payload?.global?.language]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='border p-2 rounded-[100%] cursor-pointer' onClick={onPlay}>
          {!isLoading && (playState ? <FaRegCirclePause className='text-[25px]' /> : <FaRegCirclePlay className='text-[25px]' />)}
          {isLoading && (<Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />)}
        </div>
        {
          <div className={`border p-2 rounded-[100%] ${audioData.audioSrc ? 'cursor-pointer' : 'cursor-no-drop'} `} onClick={onDownload}>
            <IoDownloadOutline className={`text-[25px] ${audioData.audioSrc ? 'text-black' : 'text-[#888]'}`} />
          </div>
        }
      </div>
    </div>
  );
};

export default AudioPlayer;
