import { IEvent, ILocation, IPhoto, ITag } from "@/common/interfaces";
import { useAuth } from '@/contexts/AuthContext';
import { Card, Divider, Image, Typography, message } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_URL } from '../../common/constants';

const EventId = () => {
    const router = useRouter();
    const { event_id } = router.query;
    const [event, setEvent] = useState<IEvent | null>(null);
    const [location, setLocation] = useState<ILocation | null>(null);
    const [tags, setTags] = useState<ITag[] | null>(null);
    const [photos, setPhotos] = useState<IPhoto[] | null>(null);
    const { getAuthState } = useAuth();

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/api/events/${event_id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${getAuthState().token}`,
                    },
                });
                if (response.ok) {
                    const eventData = await response.json();
                    setEvent(eventData);
                    setLocation(eventData.location);
                    setTags(eventData.tags);
                    setPhotos(eventData.photos);
                    console.log(eventData);
                } else if (!response.ok) {
                    message.error('Error fetching event details');
                }
            } catch (error) {
                console.error(error);
                message.error('Failed to fetch event details');
            }
        };

        if (event_id) {
            fetchEventDetails();
        }

    }, [event_id, getAuthState]);

    const formatDate = (date: string) => {
        return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    };

    const renderEventPhotos = (photos: IPhoto[] | undefined) => {
        return (
            <div style={{ overflowX: "auto", whiteSpace: "nowrap", textAlign: "center" }}>
                {photos?.map((photo, index) => (
                    <div key={index} style={{ display: "inline-block", margin: 5 }} >
                        <Image
                            src={photo.photo}
                            alt={`Event Photo ${index + 1}`}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            backgroundColor: "#eaf7f0",
            padding: "20px",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            {event ? (
                <Card style={{ width: "50%" }}>
                    <Typography.Text style={{ fontSize: "18px", fontWeight: "bold" }}>Event: {event_id}</Typography.Text>
                    <Divider />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <Typography.Text style={{ color: "#66bb6a", fontSize: "12px" }}> Post Time: {formatDate(event.post_time)} </Typography.Text>
                            <Typography.Text style={{ color: "#66bb6a", fontSize: "12px" }}>Exp time: {formatDate(event.exp_time)}</Typography.Text>
                        </div>
                        <Typography.Text>Created by: {event.createdBy.name}</Typography.Text>
                        <Typography.Text>Description: {event.description}</Typography.Text>
                        <Typography.Text>Qty: {event.qty}</Typography.Text>
                        <Typography.Text>Tags: {tags?.map(tag => tag.name).join(', ')}</Typography.Text>
                        <div>
                            <Typography.Text>Location: {location?.Address}, </Typography.Text>
                            <Typography.Text>Floor {location?.floor}, </Typography.Text>
                            <Typography.Text>Room {location?.room}</Typography.Text>
                        </div>
                        <Typography.Text>Location Note: {location?.loc_note} </Typography.Text>
                        <span>{renderEventPhotos(photos?.map(photo => photo))}</span>
                    </div>
                </Card>
            ) : (
                <p>Event not found</p>
            )}
        </div>
    );
};

export default EventId;