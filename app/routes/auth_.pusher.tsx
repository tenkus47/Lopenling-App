import { ActionFunction } from '@remix-run/node';
import pusher from '~/services/pusher.server';
import { getUserSession } from '~/services/session.server';

export const action: ActionFunction = async ({ request }) => {
  let user = await getUserSession(request);
  let formData = await request.formData();
  const socket_id = formData.get('socket_id') as string;
  const channel_name = formData.get('channel_name') as string;
  if (user) {
    let presenceData = {
      user_id: user.id,
      user_info: {
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
    try {
      let auth = pusher.authenticate(socket_id, channel_name, presenceData);
      return auth;
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};
