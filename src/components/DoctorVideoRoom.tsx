'use client';

import {
    LiveKitRoom,
    VideoTrack,
    useTracks,
    useParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

interface DoctorVideoRoomProps {
    token: string;
    serverUrl: string;
    onDisconnect?: () => void;
}

function RemoteVideoTrack() {
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
    const participants = useParticipants();

    // Find remote participant's camera track (not local)
    const remoteVideoTrack = tracks.find(
        (trackRef) => trackRef.participant.isLocal === false
    );

    if (!remoteVideoTrack) {
        return (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
                <div className="text-center">
                    <p className="text-lg font-medium">Waiting for Doctor...</p>
                    <p className="text-sm">
                        {participants.length > 1
                            ? 'Doctor connected, enabling camera...'
                            : 'Share the room link to join'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <VideoTrack
            trackRef={remoteVideoTrack}
            className="h-full w-full object-cover"
        />
    );
}

export function DoctorVideoRoom({ token, serverUrl, onDisconnect }: DoctorVideoRoomProps) {
    return (
        <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            video={false}
            audio={false}
            onDisconnected={onDisconnect}
            className="h-full w-full"
        >
            <RemoteVideoTrack />
        </LiveKitRoom>
    );
}
