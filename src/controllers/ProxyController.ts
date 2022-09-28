import { AuthRequest, SessionRequest } from '../types';
import { NextFunction, Request, Response } from 'express';
import proxyService from '../services/ProxyService';
import groupProxyService from '../services/GroupProxyService';
import ApiError from '../exceptions/ApiError';
import { DateTime } from 'luxon';

export class ProxyController {
  public async searchOffers(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { arrival, departure } = req.body.accommodation;
      const today = DateTime.now().startOf('day');
      if (
        today > DateTime.fromISO(arrival).startOf('day') ||
        today > DateTime.fromISO(departure).startOf('day')
      ) {
        throw ApiError.BadRequest('Dates must be in future');
      }

      if (
        DateTime.fromISO(arrival).startOf('day') >=
        DateTime.fromISO(departure).startOf('day')
      ) {
        throw ApiError.BadRequest(
          'checkout time must be larger than checkin time'
        );
      }

      const offers = await proxyService.getDerbySoftOffers(
        req.body,
        req.sessionId
      );

      res.json(offers);
    } catch (e) {
      next(e);
    }
  }

  public async offerPrice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { offerId } = req.params;
      const data = await proxyService.getDerbySoftOfferPrice(offerId);

      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  public async getPricedOffer(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { offerId } = req.params;
      const data = await proxyService.getPricedOffer(offerId);

      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  public async getAccommodation(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { accommodationId } = req.params;
      const data = await proxyService.getAccommodation(
        accommodationId,
        req.sessionId
      );

      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  // TODO: add cache mechanism to group search.
  public async searchGroupOffers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { arrival, departure } = req.body.accommodation;
      const today = DateTime.now().startOf('day');
      if (
        today > DateTime.fromISO(arrival).startOf('day') ||
        today > DateTime.fromISO(departure).startOf('day')
      ) {
        throw ApiError.BadRequest('Dates must be in future');
      }

      const offers = await groupProxyService.getGroupOffers(req.body);

      res.json(offers);
    } catch (e) {
      next(e);
    }
  }
}

export default new ProxyController();
