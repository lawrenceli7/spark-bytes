import { Request, Response } from 'express';
import prisma from '../prisma_client.ts';

export const get_events_for_user = async (req: Request, res: Response) => {
  const userId = req.body.user.id;
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            createdById: userId,
          },
        ],
      },
      // for showing tags and location
      include: {
        tags: true,
        location: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    return res.json(events);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const get_active_events = async (_: Request, res: Response) => {
  try {
    const now = new Date();
    const activeEvents = await prisma.event.findMany({
      where: {
        AND: [
          {
            exp_time: {
              gt: now,
            },
          },
          {
            done: false,
          },
        ],
      },
      include: {
        tags: true,
        location: true,
        photos: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    return res.json({ events: activeEvents });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const get_event_by_id = async (req: Request, res: Response) => {
  // Fields expected from the client in the GET request:
  // - event_id: number
  const { event_id } = req.params;

  // Check if event_id exists and is a valid number
  if (!event_id || isNaN(Number(event_id))) {
    return res.status(400).json({ error: 'Invalid event_id' });
  }
  try {
    const event = await prisma.event.findUnique({
      where: { event_id: Number(event_id) },
      include: {
        tags: true,
        location: true,
        photos: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    if (event === null) {
      return res.status(404).json({ error: 'Event ID not found' });
    }
    return res.json(event);
  } catch (error) {
    console.error('Error retrieving event description:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const create_event = async (req: Request, res: Response) => {
  const { exp_time, description, qty, tags, photos, location } = req.body;
  
  const user = req.body.user;
    if (!user || !user.canPostEvents) {
      res.status(403).json({ error: 'User does not have permission to post events' });
    }
  
  const userId = req.body.user?.id; // Ensure user information is available
  const now = new Date().toISOString();

  try {
    // Determine location creation or connection
    let locationData;
    if (location.id) {
      locationData = { connect: { id: location.id } };
    } else {
      locationData = {
        create: {
          Address: location.Address,
          floor: parseInt(location.floor, 10),
          room: location.room,
          loc_note: location.loc_note || null,
        },
      };
    }

    // Validate and map tag IDs
    const tagConnections = tags.map((tagId) => ({ tag_id: tagId }));

    // Prepare photo data
    const photoData = photos.map((photo) => ({ photo }));

    // Create the event
    const newEvent = await prisma.event.create({
      data: {
        post_time: now,
        exp_time,
        description,
        qty,
        done: false,
        tags: {
          connect: tagConnections,
        },
        createdBy: {
          connect: { id: userId },
        },
        location: locationData,
        photos: {
          createMany: {
            data: photoData,
          },
        },
      },
    });

    return res.status(201).json(newEvent);
  } catch (error) {
    // Log the detailed error message
    console.error('Error creating event:', error.message, error.stack);
    return res.status(500).json({ error: 'Server error while creating event' });
  }
};




export const edit_event = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const { exp_time, description, qty, location, photo, tag_ids } = req.body;

  try {
    const updatedEvent = await prisma.event.update({
      where: {
        event_id: Number(event_id),
      },
      data: {
        exp_time,
        description,
        qty,
        location: {
          update: {
            Address: location.Address,
            floor: location.floor,
            room: location.room,
            loc_note: location.loc_note,
          },
        },
        tags: {
          set: tag_ids.map((tag_id: number) => ({ tag_id })),
        },
      },
      include: {
        tags: true,
        location: true,
        photos: true,
      },
    });

    if (photo) {
      const newPhoto = await prisma.photo.create({
        data: {
          photo: photo,
          event: { connect: { event_id: updatedEvent.event_id } },
        },
      });
      updatedEvent.photos.push(newPhoto);
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const get_all_locations = async (_: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({});
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
